export class CreateAssemblyaiDto {}

export class AssemblyResponseDto {
  id: number;
  originalAudioUrl: string;
  transcript: string;
  youtube: any;
  facebook: any;
  instagram: any;
  tiktok: any;
  cross_platform_tips?: any;
  createdAt: Date;
}
