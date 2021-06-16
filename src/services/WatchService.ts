class WatchService {
  private interval: number;

  start(callback: TimerHandler, interval = 5000): void {
    this.interval = setInterval(callback, interval);
  }

  stop(): void {
    clearInterval(this.interval);
  }
}

export default WatchService;
