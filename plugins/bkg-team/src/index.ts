// BKG Team - OpenCode Plugin (v2: dashboard webserver, git gates, audit)
import type { Plugin, Hooks } from '@opencode-ai/plugin';
import { z } from 'zod';
import { mkdir, readFile, writeFile, readdir } from 'fs/promises';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join as joinPath } from 'path';
import { fileURLToPath } from 'url';
import { spawn, execFile, execFileSync, spawnSync } from 'child_process';

interface CommandDef { name: string; description: string; subtask?: boolean; template: string; }

function loadCommands(dir: string): CommandDef[] {
  const commands: CommandDef[] = [];
  try {
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const content = readFileSync(joinPath(dir, file), 'utf-8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let body = content; let description = ''; let subtask: boolean | undefined;
      if (fmMatch) {
        body = content.slice(fmMatch[0].length).trim();
        for (const line of fmMatch[1].split('\n')) {
          const idx = line.indexOf(':'); if (idx === -1) continue;
          const key = line.slice(0, idx).trim(); const value = line.slice(idx + 1).trim();
          if (key === 'description') description = value;
          if (key === 'subtask') subtask = value === 'true';
        }
      }
      commands.push({ name: file.replace(/\.md$/, ''), description: description || file, subtask, template: body });
    }
  } catch {}
  return commands;
}

async function audit(worktree: string, entry: Record<string, unknown>): Promise<void> {
  try {
    const dir = joinPath(worktree, '.brain');
    await mkdir(dir, { recursive: true });
    await writeFile(joinPath(dir, 'audit.jsonl'), JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n', { flag: 'a' });
  } catch {}
}

function run(cwd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd, maxBuffer: 4 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message)); else resolve(stdout);
    });
  });
}

async function ensureDashboardServer(projectDir: string): Promise<{ url: string; started: boolean }> {
  const rootFile = joinPath(process.env.HOME || '/home/bkg', '.config/opencode/plugins/bkg-team/.dashboard-root');
  try {
    await mkdir(dirname(rootFile), { recursive: true });
    await writeFile(rootFile, projectDir, 'utf8');
  } catch {}
  const ctl = (args: string[]): Promise<string> => new Promise((resolve) => {
    execFile('systemctl', ['--user', ...args], (err, stdout) => resolve(err ? String(err) : stdout));
  });
  const isActive = (await ctl(['is-active', 'bkg-dashboard'])).trim() === 'active';
  if (!isActive) {
    await ctl(['enable', '--now', 'bkg-dashboard']);
    for (let i = 0; i < 8; i++) {
      await new Promise((r) => setTimeout(r, 350));
      if ((await ctl(['is-active', 'bkg-dashboard'])).trim() === 'active') break;
    }
  }
  const dbg = await ctl(['is-active','bkg-dashboard']);
  return { url: 'http://127.0.0.1:4317', started: !isActive };
}

interface VoteRecord { topic: string; agent: string; vote: 'approve'|'revise'|'reject'|'blocked'; reason: string; timestamp: string; }
function tally(votes: VoteRecord[]) {
  const approvals = votes.filter(v => v.vote === 'approve').length;
  return { approved: approvals >= 2, approvals, arbiterRequired: approvals < 2 && votes.length >= 3 };
}
async function brainPath(worktree: string, name: string) {
  const dir = joinPath(worktree, '.brain'); await mkdir(dir, { recursive: true });
  return joinPath(dir, name + '.json');
}

const BkgTeamPlugin: Plugin = async () => {
  const pluginDir = dirname(fileURLToPath(import.meta.url));
  const commands = loadCommands(pluginDir);
  const hooks: Hooks = {
    async config(config) {
      const cfg = config as Record<string, unknown>;
      const rec = (cfg.command as Record<string, unknown>) || {};
      for (const c of commands) rec['bkg-' + c.name] = { template: c.template, description: c.description, ...(c.subtask !== undefined ? { subtask: c.subtask } : {}) };
      cfg.command = rec;
    },
    tool: {
      'bkg-brain-team': {
        description: 'Read or persist BKG project Brain JSON records (project, tasks, decisions, memory, blockers, research, agents, teams).',
        args: { action: z.enum(['read','append']), record: z.enum(['project','tasks','decisions','memory','blockers','research','agents','teams']), value: z.string().optional() },
        async execute(args: { action:'read'|'append'; record:string; value?:string }, context) {
          try {
            const path = await brainPath(context.worktree, args.record);
            if (args.action === 'read') return await readFile(path, 'utf8');
            if (!args.value) return JSON.stringify({ success:false, error:'value is required for append' });
            const parsed = JSON.parse(args.value);
            let cur: unknown = {};
            try { cur = JSON.parse(await readFile(path, 'utf8')); } catch {}
            const next = Array.isArray(cur) ? [...(cur as unknown[]), parsed] : { ...(cur as object), last: parsed };
            await writeFile(path, JSON.stringify(next, null, 2) + '\n', 'utf8');
            await audit(context.worktree, { tool:'bkg-brain-team', action:'append', record: args.record });
            return 'brain updated: ' + path;
          } catch (e) { return JSON.stringify({ success:false, error: e instanceof Error ? e.message : String(e) }); }
        },
      },
      'bkg-vote-team': {
        description: 'Persist a specialist vote and calculate BKG debate consensus. Two approvals approve; 3+ votes without 2 approvals escalate to the Arbiter.',
        args: { topic: z.string(), agent: z.string(), vote: z.enum(['approve','revise','reject','blocked']), reason: z.string() },
        async execute(args: { topic:string; agent:string; vote:'approve'|'revise'|'reject'|'blocked'; reason:string }, context) {
          try {
            const path = await brainPath(context.worktree, 'decisions');
            let root: Record<string, unknown> = {};
            try { root = JSON.parse(await readFile(path, 'utf8')); } catch {}
            const votes = Array.isArray(root.votes) ? root.votes as VoteRecord[] : [];
            votes.push({ ...args, timestamp: new Date().toISOString() });
            root.votes = votes;
            await writeFile(path, JSON.stringify(root, null, 2) + '\n', 'utf8');
            const tallyR = tally(votes.filter(v => v.topic === args.topic));
            await audit(context.worktree, { tool:'bkg-vote-team', topic: args.topic, agent: args.agent, vote: args.vote });
            return JSON.stringify({ topic: args.topic, votes: votes.filter(v=>v.topic===args.topic), ...tallyR }, null, 2);
          } catch (e) { return JSON.stringify({ success:false, error: e instanceof Error ? e.message : String(e) }); }
        },
      },
      'bkg-dashboard-team': {
        description: 'Write/update the local live dashboard HTML and start the local dashboard webserver for this project.',
        args: { title: z.string().optional(), status: z.string().optional() },
        async execute(args: { title?: string; status?: string }, context) {
          try {
            const dir = joinPath(context.worktree, 'docs', 'debat', 'live');
            await mkdir(dir, { recursive: true });
            const esc = (v: string) => v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
            const html = '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="refresh" content="5">'
              + '<title>BKG Debate - ' + esc(args.title ?? 'Live') + '</title>'
              + '<style>body{font:14px system-ui;background:#0d1117;color:#c9d1d9;padding:24px}section{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:14px;margin-bottom:12px}pre{white-space:pre-wrap}audio{width:100%}</style></head><body>'
              + '<h1>' + esc(args.title ?? 'BKG Debate') + '</h1><p>Status: <b>' + esc(args.status ?? 'waiting') + '</b> - auto-refresh 5s</p>'
              + '<section><h2>Brain</h2><pre id="state">lade...</pre></section>'
              + '<section><h2>TTS-Aufnahmen (.brain/audio)</h2><div id="audio">lade...</div></section>'
              + '<script>async function load(){try{const st=await fetch("/api/state").then(r=>r.json());document.getElementById("state").textContent=JSON.stringify(st,null,2);const au=await fetch("/api/audio").then(r=>r.json());document.getElementById("audio").innerHTML=(au.entries||[]).slice(-20).reverse().map(e=>"<div style=\\"margin-bottom:8px\\">"+e.file+"<br><audio controls preload=none src=/audio/"+e.file.split("/").pop()+"></audio></div>").join("")||"(noch keine Aufnahmen)";}catch(e){document.getElementById("state").textContent="Fehler: "+e.message}}load();setInterval(load,5000);</script></body></html>';
            const file = joinPath(context.worktree, 'docs', 'debat', 'live', 'index.html');
            await writeFile(file, html, 'utf8');
            await new Promise(r => setTimeout(r, 700));
            const server = await ensureDashboardServer(context.worktree);
            await audit(context.worktree, { tool:'bkg-dashboard-team', url: server.url });
            return JSON.stringify({ success:true, file, url: server.url || null, serverStarted: server.started }, null, 2);
          } catch (e) { return JSON.stringify({ success:false, error: e instanceof Error ? e.message : String(e) }); }
        },
      },
      'bkg-git-team': {
        description: 'Safe explicit BKG Git operations. Mutating actions (commit/pull/push) require approve:true. Destructive commands are refused by policy.',
        args: { action: z.enum(['status','diff','pull','commit','push']), message: z.string().optional(), approve: z.boolean().optional() },
        async execute(args: { action:'status'|'diff'|'pull'|'commit'|'push'; message?:string; approve?:boolean }, context) {
          try {
            const cwd = context.worktree;
            if (args.action === 'status') return await run(cwd, ['status','--short','--branch']);
            if (args.action === 'diff') return await run(cwd, ['diff','--stat']);
            if (!args.approve) {
              await audit(cwd, { tool:'bkg-git-team', action: args.action, blocked:'missing approval' });
              return JSON.stringify({ success:false, error: args.action + ' requires approve:true (mutation gate)' });
            }
            let out: string;
            if (args.action === 'pull') out = await run(cwd, ['pull','--ff-only']);
            else if (args.action === 'commit') {
              if (!args.message || !args.message.trim()) throw new Error('commit requires message');
              await run(cwd, ['add','-A']);
              out = await run(cwd, ['commit','-m', args.message]);
            } else out = await run(cwd, ['push']);
            await audit(cwd, { tool:'bkg-git-team', action: args.action, ok:true });
            return out;
          } catch (e) {
            await audit(context.worktree, { tool:'bkg-git-team', action: args.action, error: e instanceof Error ? e.message : String(e) }).catch(() => {});
            return JSON.stringify({ success:false, error: e instanceof Error ? e.message : String(e) });
          }
        },
      },
      'bkg-research-team': {
        description: 'Fetch a public documentation or repository URL for evidence-backed research.',
        args: { url: z.string().url() },
        async execute(args: { url: string }) {
          try {
            const response = await fetch(args.url, { redirect: 'follow' });
            const text = await response.text();
            return JSON.stringify({ url: args.url, status: response.status, ok: response.ok, text: text.slice(0, 30000) });
          } catch (e) { return JSON.stringify({ success:false, error: e instanceof Error ? e.message : String(e) }); }
        },
      },
      'bkg-supervisor-team': {
        description: 'Inspect actual BKG project agent/tool/skill/rule deployment (.opencode tree and opencode.json).',
        args: {},
        async execute(_args: Record<string, never>, context) {
          try {
            const names = async (dir: string): Promise<string[]> => { try { return (await readdir(dir)).sort(); } catch { return []; } };
            const root = joinPath(context.worktree, '.opencode');
            const result: Record<string, unknown> = {
              agents: await names(joinPath(root, 'agents')),
              commands: await names(joinPath(root, 'commands')),
              skills: await names(joinPath(root, 'skills')),
              tools: await names(joinPath(root, 'tools')),
              rules: await names(joinPath(root, 'rules')),
              plugins: await names(joinPath(root, 'plugins')),
              config: null,
            };
            try { result.config = JSON.parse(await readFile(joinPath(context.worktree, 'opencode.json'), 'utf8')); } catch {}
            return JSON.stringify(result, null, 2);
          } catch (e) { return JSON.stringify({ success:false, error: e instanceof Error ? e.message : String(e) }); }
        },
      },
    },
  };
  return hooks;
};

BkgTeamPlugin.BUILD_TAG = "team-v7-dashboardctl";
export default BkgTeamPlugin;
