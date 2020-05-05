interface res {
  status?: number;
  data?: any;
  statusText?: string;
}

export default class Result {
  status: number;
  data: any;
  statusText: string;
  constructor({ status = 200, data = null, statusText = 'OK' }: res) {
    this.status = status;
    this.data = data;
    this.statusText = statusText;
  }
}
