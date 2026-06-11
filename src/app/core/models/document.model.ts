export interface NaoDocument<TType extends string, TData> {
  docId: string;
  docType: TType;
  data: TData;
}
