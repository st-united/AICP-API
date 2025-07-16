import { PrismaClient, CompetencyAspect, Domain } from '@prisma/client';

export async function seedCourses(prisma: PrismaClient, categories: CompetencyAspect[], domains: Domain[]) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c]));
  const domainMap = Object.fromEntries(domains.map((d) => [d.name, d]));

  const coursesData = [
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
      aspectId: categoryMap[courseData.category].id,
      domainId: domainMap[courseData.domain].id,
    })),
  });
}
