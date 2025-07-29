import { PrismaClient, CompetencyAspect, Domain, SFIALevel } from '@prisma/client';
import { link } from 'joi';

export async function seedCourses(prisma: PrismaClient, categories: CompetencyAspect[], domains: Domain[]) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c]));
  const domainMap = Object.fromEntries(domains.map((d) => [d.name, d]));

  const coursesData = [
    {
      title: 'FT01 - AI - READINESS MINDSET',
      description:
        'Chương trình đào tạo được thiết kế để giúp học viên làm rõ nhận thức về AI, xây dựng tư duy sẵn sàng và định vị bản thân trong thời đại kỷ nguyên số. Tham gia để bắt đầu hành trình chuyển đồi cùng AI đầy cảm hứng!',
      provider: 'Coursera',
      url: 'https://learn.devplus.edu.vn/course/view.php?id=31',
      linkImage: 'https://learn.devplus.edu.vn/pluginfile.php/2785/block_html/content/FT01.png',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Công nghệ thông tin',
      sfiaLevels: [SFIALevel.LEVEL_1_AWARENESS, SFIALevel.LEVEL_2_FOUNDATION, SFIALevel.LEVEL_3_APPLICATION],
    },
    {
      title: 'FT02 - APPLY AI FOR DEV',
      description:
        'Chương trình đào tạo được thiết kế để trang bị cho học viên kỹ năng ứng dụng AI thực tiễn trong phát triển phần mềm, mở ra cơ hội nâng cao hiệu suất và tối ưu hóa công việc. Bạn đã sẵn sàng trở thành một lập trình viên AI - Powered, dẫn đầu trong kỷ nguyên công nghệ mới chưa?',
      provider: 'Coursera',
      url: 'https://learn.devplus.edu.vn/course/view.php?id=32',
      linkImage: 'https://learn.devplus.edu.vn/pluginfile.php/2789/block_html/content/FT02.png',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Công nghệ thông tin',
      sfiaLevels: [SFIALevel.LEVEL_4_INTEGRATION, SFIALevel.LEVEL_5_INNOVATION, SFIALevel.LEVEL_6_LEADERSHIP],
    },
    {
      title: 'Introduction to AI Ethics',
      description: 'A foundational course on ethical considerations in AI development and deployment',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/ai-ethics',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Đa lĩnh vực',
    },
    {
      title: 'Machine Learning with Python',
      description: 'Learn practical machine learning techniques using Python',
      provider: 'edX',
      url: 'https://www.edx.org/learn/machine-learning',
      category: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
      domain: 'Đa lĩnh vực',
    },
    {
      title: 'AI for Healthcare',
      description: 'Applications of AI in healthcare diagnostics and treatment',
      provider: 'Udacity',
      url: 'https://www.udacity.com/course/ai-for-healthcare',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Y tế',
    },
    {
      title: 'Financial Analysis with AI',
      description: 'Using AI techniques for financial forecasting and analysis',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/financial-analysis-ai',
      category: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
      domain: 'Tài chính',
    },
    {
      title: 'Critical Thinking for AI Implementation',
      description: 'Developing critical thinking skills for evaluating AI applications',
      provider: 'LinkedIn Learning',
      url: 'https://www.linkedin.com/learning/critical-thinking-ai',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Đa lĩnh vực',
    },
    {
      title: 'AI in Information Technology',
      description: 'Practical applications of AI in Information Technology processes',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/ai-Information Technology',
      category: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
      domain: 'Công nghệ thông tin',
    },
  ];

  await prisma.course.createMany({
    data: coursesData.map((courseData) => ({
      title: courseData.title,
      description: courseData.description,
      provider: courseData.provider,
      url: courseData.url,
      linkImage: courseData.linkImage || null,
      aspectId: categoryMap[courseData.category].id,
      domainId: domainMap[courseData.domain].id,
      sfiaLevels: courseData.sfiaLevels ?? [],
    })),
  });
}
