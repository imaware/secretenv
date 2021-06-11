export interface SecretResolverFunc {
  (match: RegExpMatchArray): Promise<string | undefined>;
}
