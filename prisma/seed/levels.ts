import { PrismaClient, SFIALevel } from '@prisma/client';

export async function seedLevels(prisma: PrismaClient) {
  const levelsData = [
    {
      name: 'LEVEL_1 - AWARENESS',
      description: 'Làm việc dưới sự hướng dẫn chặt chẽ, thực hiện các nhiệm vụ đơn giản, hỗ trợ các hoạt động cơ bản',
      numericValue: 1,
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
    },
    {
      name: 'LEVEL_2 - FOUNDATION',
      description:
        'Thực hiện các nhiệm vụ được giao với một số tự chủ, hỗ trợ đồng nghiệp, làm việc trong quy trình đã định sẵn',
      numericValue: 2,
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
    },
    {
      name: 'LEVEL_3 - APPLICATION',
      description:
        'Xử lý các nhiệm vụ phức tạp hơn, áp dụng kiến thức chuyên môn, chịu trách nhiệm cho công việc cá nhân hoặc nhóm nhỏ',
      numericValue: 3,
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
    },
    {
      name: 'LEVEL_4 - INTEGRATION',
      description:
        'Quản lý và dẫn dắt các hoạt động, chịu trách nhiệm về kết quả, hỗ trợ người khác trong công việc chuyên môn',
      numericValue: 4,
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
    },
    {
      name: 'LEVEL_5 - INNOVATION',
      description: 'Lãnh đạo dự án hoặc nhóm, cung cấp tư vấn chuyên môn, đảm bảo chất lượng và hiệu quả công việc',
      numericValue: 5,
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
    },
    {
      name: 'LEVEL_6 - LEADERSHIP',
      description: 'Định hình chiến lược, lãnh đạo các sáng kiến lớn, tạo tác động rộng trong tổ chức hoặc ngành',
      numericValue: 6,
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
    },
    {
      name: 'LEVEL_7 - MASTERY',
      description:
        'Thiết lập chiến lược cấp cao, lãnh đạo tổ chức, truyền cảm hứng và thúc đẩy thay đổi ở cấp độ ngành hoặc toàn cầu',
      numericValue: 7,
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
    },
  ];

  await prisma.level.createMany({
    data: levelsData,
    skipDuplicates: false,
  });
}
