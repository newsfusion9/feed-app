export interface INewsletter {
  _id: string;
  name: string;
  email: string;
  rssUrl?: string;
  active: boolean;
}
