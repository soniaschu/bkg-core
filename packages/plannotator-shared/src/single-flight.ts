// @plannotator/shared/single-flight

export class SingleFlight {
  execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

