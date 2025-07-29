import { ExamLevelEnum, PrismaClient } from '@prisma/client';

export async function seedExamLevels(prisma: PrismaClient) {
  const levelsData = [
    {
      name: 'LEVEL_1 - STARTER',
      description:
        'Bạn đang bước vào thế giới AI với sự tò mò và cởi mở. Ở level này, bạn có thể hiểu được khái niệm cơ bản về AI, biết AI là gì và có thể ứng dụng vào đâu. Tuy chưa thực hành nhiều, nhưng bạn đã nhận ra tiềm năng của AI và có động lực học hỏi',
      learningPath:
        'Tham gia khóa học AI cơ bản và thực hành hàng ngày với ChatGPT, Gemini cho các tác vụ đơn giản. Đồng thời tham gia các khóa học nhập môn để xây dựng nền tảng tư duy',
      examLevel: ExamLevelEnum.LEVEL_1_STARTER,
    },
    {
      name: 'LEVEL_2 - EXPLORER',
      description:
        'Bạn đã vượt qua giai đoạn "sợ hãi" ban đầu và bắt đầu tự tin sử dụng các công cụ AI cơ bản. Có thể viết prompt hiệu quả cho các tác vụ thường gặp như soạn email, tóm tắt nội dung, hoặc brainstorm ý tưởng. Bạn đang dần hình thành thói quen sử dụng AI trong công việc hàng ngày',
      learningPath:
        'Thực hành viết prompt nâng cao với các kỹ thuật cụ thể, áp dụng AI vào các tác vụ phức tạp trong công việc và tham gia cộng đồng AI để học hỏi từ kinh nghiệm thực tế',
      examLevel: ExamLevelEnum.LEVEL_2_EXPLORER,
    },
    {
      name: 'LEVEL_3 - PRACTITIONER',
      description:
        'Bạn đã có thể sử dụng AI để giải quyết các vấn đề thực tế trong công việc một cách hiệu quả. Có khả năng kết hợp nhiều công cụ AI khác nhau và tùy chỉnh workflow phù hợp với nhu cầu cụ thể. Bạn bắt đầu nhận ra những hạn chế của AI và biết cách làm việc xung quanh chúng',
      learningPath:
        'Học cách tối ưu hóa quy trình làm việc bằng AI automation, đồng thời khám phá các công cụ AI chuyên sâu trong từng lĩnh vực cụ thể và thực hành xây dựng các giải pháp AI phù hợp cho nhóm hoặc dự án để nâng cao hiệu quả và tính ứng dụng trong thực tế',
      examLevel: ExamLevelEnum.LEVEL_3_PRACTITIONER,
    },
    {
      name: 'LEVEL_4 - INTEGRATOR',
      description:
        'Bạn không chỉ sử dụng AI mà còn biết cách kết hợp nhiều công cụ AI để tạo ra giải pháp tối ưu và sáng tạo. Có khả năng phân tích các bài toán phức tạp và thiết kế workflow AI phù hợp. Bạn đã trở thành người đồng nghiệp khác tham khảo về AI và có thể đào tạo người khác',
      learningPath:
        'Tham gia các khóa học AI chuyên sâu theo lĩnh vực cụ thể, đồng thời dẫn dắt các dự án pilot AI trong tổ chức và xây dựng hệ thống đánh giá, kiểm soát chất lượng AI nhằm đảm bảo hiệu quả triển khai và tính minh bạch trong quá trình ứng dụng',
      examLevel: ExamLevelEnum.LEVEL_4_INTEGRATOR,
    },
    {
      name: 'LEVEL_5 - STRATEGIST',
      description:
        'Bạn đã có khả năng nhìn nhận AI từ góc độ chiến lược kinh doanh, không chỉ sử dụng mà còn định hướng cách thức áp dụng AI để tạo ra giá trị bền vững. Có thể phân tích tác động của AI đối với ngành và xây dựng roadmap triển khai AI cho tổ chức. Bạn đã trở thành người có tiếng nói trong việc ra quyết định về AI',
      learningPath:
        'Tham gia các hội thảo cấp cao về chiến lược và quản trị AI, triển khai các dự án AI có tác động quy mô lớn, đồng thời xây dựng mạng lưới chuyên gia AI trong ngành để mở rộng tầm ảnh hưởng và thúc đẩy đổi mới sáng tạo',
      examLevel: ExamLevelEnum.LEVEL_5_STRATEGIST,
    },
    {
      name: 'LEVEL_6 - LEADER',
      description:
        'Bạn đã trở thành người dẫn dắt trong việc ứng dụng AI, có khả năng truyền cảm hứng và định hướng cho nhiều người khác. Tầm ảnh hưởng của bạn vượt ra ngoài tổ chức, góp phần định hình cách thức ngành sử dụng AI. Có thể dự đoán xu hướng và chuẩn bị tổ chức cho tương lai AI',
      learningPath:
        'Tham gia các chương trình lãnh đạo cấp cao về quản trị AI, dẫn dắt các sáng kiến AI có tác động rộng trong ngành, đồng thời hướng dẫn và phát triển thế hệ lãnh đạo AI tiếp theo để thúc đẩy sự phát triển bền vững và có trách nhiệm trong lĩnh vực trí tuệ nhân tạo',
      examLevel: ExamLevelEnum.LEVEL_6_LEADER,
    },
    {
      name: 'LEVEL_7 - EXPERT',
      description:
        'Bạn là người định hình tương lai của AI trong lĩnh vực và có tác động toàn cầu. Khả năng sáng tạo và tầm ảnh hưởng của bạn tạo ra những bước đột phá, truyền cảm hứng cho cộng đồng AI rộng lớn. Được công nhận là thought leader và có khả năng dự đoán, định hướng xu hướng AI trong tương lai',
      learningPath:
        'Nghiên cứu và phát triển các công nghệ AI thế hệ mới, tham gia các tổ chức quốc tế về đạo đức và quản trị AI, đồng thời đóng góp vào việc xây dựng tương lai bền vững cho trí tuệ nhân tạo',
      examLevel: ExamLevelEnum.LEVEL_7_EXPERT,
    },
  ];

  await prisma.examLevel.createMany({
    data: levelsData,
    skipDuplicates: false,
  });
}
