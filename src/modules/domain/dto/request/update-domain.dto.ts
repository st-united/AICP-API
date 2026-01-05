import { PickType } from '@nestjs/swagger';
import { CreateDomainDto } from '@app/modules/domain/dto/request/create-domain.dto';

export class UpdateDomainDto extends PickType(CreateDomainDto, ['name', 'description'] as const) {}
