import { ExamLevelEnum, PrismaClient } from '@prisma/client';

export async function seedExamLevels(prisma: PrismaClient) {
  const levelsData = [
    {
      name: 'LEVEL_1 - STARTER',
      description:
        'Bạn đang bước vào thế giới AI với sự tò mò và cởi mở. Ở level này, bạn có thể hiểu được khái niệm cơ bản về AI, biết AI là gì và có thể ứng dụng vào đâu. Tuy chưa thực hành nhiều, nhưng bạn đã nhận ra tiềm năng của AI và có động lực học hỏi',
      learningPath:
        'Bạn nên khám phá các tài liệu về ứng dụng AI trong công việc đồng thời tham gia các khóa học nhập môn để củng cố kiến thức nền tảng và rèn luyện kỹ năng thực tiễn',
      examLevel: ExamLevelEnum.LEVEL_1_STARTER,
    },
    {
      name: 'LEVEL_2 - EXPLORER',
      description:
        'Bạn đã vượt qua giai đoạn "sợ hãi" ban đầu và bắt đầu tự tin sử dụng các công cụ AI cơ bản. Có thể viết prompt hiệu quả cho các tác vụ thường gặp như soạn email, tóm tắt nội dung, hoặc brainstorm ý tưởng. Bạn đang dần hình thành thói quen sử dụng AI trong công việc hàng ngày',
      examLevel: ExamLevelEnum.LEVEL_2_EXPLORER,
    },
    {
      name: 'LEVEL_3 - PRACTITIONER',
      description:
        'Bạn đã có thể sử dụng AI để giải quyết các vấn đề thực tế trong công việc một cách hiệu quả. Có khả năng kết hợp nhiều công cụ AI khác nhau và tùy chỉnh workflow phù hợp với nhu cầu cụ thể. Bạn bắt đầu nhận ra những hạn chế của AI và biết cách làm việc xung quanh chúng',
      examLevel: ExamLevelEnum.LEVEL_3_PRACTITIONER,
    },
    {
      name: 'LEVEL_4 - INTEGRATOR',
      description:
        'Bạn không chỉ sử dụng AI mà còn biết cách kết hợp nhiều công cụ AI để tạo ra giải pháp tối ưu và sáng tạo. Có khả năng phân tích các bài toán phức tạp và thiết kế workflow AI phù hợp. Bạn đã trở thành người đồng nghiệp khác tham khảo về AI và có thể đào tạo người khác',
      examLevel: ExamLevelEnum.LEVEL_4_INTEGRATOR,
    },
    {
      name: 'LEVEL_5 - STRATEGIST',
      description:
        'Bạn đã có khả năng nhìn nhận AI từ góc độ chiến lược kinh doanh, không chỉ sử dụng mà còn định hướng cách thức áp dụng AI để tạo ra giá trị bền vững. Có thể phân tích tác động của AI đối với ngành và xây dựng roadmap triển khai AI cho tổ chức. Bạn đã trở thành người có tiếng nói trong việc ra quyết định về AI',
      examLevel: ExamLevelEnum.LEVEL_5_STRATEGIST,
    },
    {
      name: 'LEVEL_6 - LEADER',
      description:
        'Bạn đã trở thành người dẫn dắt trong việc ứng dụng AI, có khả năng truyền cảm hứng và định hướng cho nhiều người khác. Tầm ảnh hưởng của bạn vượt ra ngoài tổ chức, góp phần định hình cách thức ngành sử dụng AI. Có thể dự đoán xu hướng và chuẩn bị tổ chức cho tương lai AI',
      examLevel: ExamLevelEnum.LEVEL_6_LEADER,
    },
    {
      name: 'LEVEL_7 - EXPERT',
      description:
        'Bạn là người định hình tương lai của AI trong lĩnh vực và có tác động toàn cầu. Khả năng sáng tạo và tầm ảnh hưởng của bạn tạo ra những bước đột phá, truyền cảm hứng cho cộng đồng AI rộng lớn. Được công nhận là thought leader và có khả năng dự đoán, định hướng xu hướng AI trong tương lai',
      examLevel: ExamLevelEnum.LEVEL_7_EXPERT,
    },
  ];

  await prisma.examLevel.createMany({
    data: levelsData,
    skipDuplicates: false,
  });
}
