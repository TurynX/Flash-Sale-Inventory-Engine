export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly hashedPassword: string,
  ) {}
}
