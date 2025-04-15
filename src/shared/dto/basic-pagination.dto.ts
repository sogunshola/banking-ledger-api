import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BasicPaginationDto {
  @ApiPropertyOptional({ default: 1, type: Number, description: 'Page number' })
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({
    default: 10,
    type: Number,
    description: 'Limit per page',
  })
  @IsOptional()
  limit = 10;
}
