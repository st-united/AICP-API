import { PrismaClient } from '@prisma/client';

export async function seedDomains(prisma: PrismaClient) {
  const domainsData = [
    {
      name: 'Y tế',
      description: 'Ứng dụng AI trong chăm sóc sức khỏe và y học',
    },
    {
      name: 'Tài chính',
      description: 'Ứng dụng AI trong dịch vụ tài chính và công nghệ tài chính',
    },
    {
      name: 'Giáo dục',
      description: 'Ứng dụng AI trong giáo dục và học tập',
    },
    {
      name: 'Công nghệ thông tin',
      description: 'Ứng dụng AI trong công nghệ thông tin và sản xuất',
    },
    {
      name: 'Đa lĩnh vực',
      description: 'Kiến thức AI tổng quát áp dụng cho nhiều lĩnh vực',
    },
    {
      name: 'Marketing',
      description: 'Ứng dụng AI trong nghiên cứu thị trường, phân tích hành vi khách hàng và chiến lược truyền thông',
    },
    {
      name: 'Thiết kế sáng tạo',
      description: 'Ứng dụng AI trong tạo hình ảnh, chỉnh sửa, thiết kế thương hiệu và sản phẩm truyền thông',
    },
    {
      name: 'Phân tích nghiệp vụ (BA)',
      description: 'Kết hợp AI để phân tích yêu cầu, tối ưu quy trình và hỗ trợ ra quyết định trong doanh nghiệp',
    },
  ];

  for (const domainData of domainsData) {
    await prisma.domain.upsert({
      where: { name: domainData.name },
      update: {},
      create: domainData,
    });
  }
}
