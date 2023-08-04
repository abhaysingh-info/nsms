// write a class-validator dto for DiscordUser

import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateDiscordUserDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class UpdateWalletAddressDto {
  @IsOptional()
  @IsString()
  connected_wallet_address: string;

  @IsOptional()
  @IsString()
  wallet_signed_txn: string;

  @ValidateIf((o) => o.wallet_signed_txn)
  @IsNotEmpty()
  @IsString()
  original_signed_message: string;
}

export class UpdateDiscordUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  discriminator: string;
}
