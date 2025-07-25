import { PrismaClient, CompetencyAspect, Domain, SFIALevel } from '@prisma/client';

export async function seedCourses(prisma: PrismaClient, categories: CompetencyAspect[], domains: Domain[]) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c]));
  const domainMap = Object.fromEntries(domains.map((d) => [d.name, d]));

  const coursesData = [
    {
      title: 'FT01 - AI - READINESS MINDSET',
      overview: `
        <p>Khóa học trang bị cho học viên tư duy nền tảng cần thiết để chủ động tiếp cận và đồng hành cùng sự phát triển của AI, thông qua trải nghiệm học tập mở, thực tiễn và định hướng dài hạn</p>`,
      description: `
        <p>FT01 là khóa học nền tảng trong chương trình đào tạo AI tại DevPlus, được thiết kế nhằm giúp sinh viên xây dựng tư duy sẵn sàng cho kỷ nguyên AI. Thông qua các buổi workshop, thảo luận mở và bài tập thực hành, học viên sẽ hiểu rõ vai trò quan trọng của mindset trong việc thích nghi và phát triển cùng công nghệ AI.</p>
        <ul>
          <li>Phân biệt đúng – sai – thiếu sót trong nhận thức về AI.</li>
          <li>Phát triển tư duy cốt lõi như tư duy phản biện, khả năng thích nghi, và tự học.</li>
          <li>Làm quen với kỹ năng không thể thay thế bởi AI: giao tiếp, làm việc nhóm, tư duy giải quyết vấn đề.</li>
          <li>Giới thiệu công cụ AI cơ bản và áp dụng trong phần thuyết trình cuối khóa.</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 8 buổi trong 4 ngày</li>
          <li><strong>Hình thức:</strong> Offline tại trung tâm đào tạo</li>
          <li><strong>Hoạt động:</strong> Workshop, quiz trên LMS, thuyết trình nhóm</li>
          <li><strong>Mentor:</strong> Chuyên gia AI từ cộng đồng DevPlus</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Dành cho người học ở mọi lĩnh vực',
      provider: 'Dev Plus',
      url: 'https://learn.devplus.edu.vn/course/view.php?id=31',
      linkImage: 'https://learn.devplus.edu.vn/pluginfile.php/2785/block_html/content/FT01.png',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Công nghệ thông tin',
      sfiaLevels: [SFIALevel.LEVEL_1_AWARENESS, SFIALevel.LEVEL_2_FOUNDATION, SFIALevel.LEVEL_3_APPLICATION],
    },
    {
      title: 'FT02 - APPLY AI FOR DEV',
      overview: `
        <p>Khóa học nâng cao giúp các lập trình viên và chuyên gia IT tích hợp AI vào quy trình phát triển phần mềm, nâng cao năng suất lập trình và chất lượng sản phẩm thông qua việc sử dụng AI như một trợ lý mạnh mẽ trong coding, testing và quản lý dự án</p>`,
      description: `
        <p>FT02 là khóa học nâng cao dành cho những học viên đã hoàn thành Challenge Day hoặc chương trình AI-Readiness Mindset (FT01). Khóa học giúp học viên hiểu rõ cách tích hợp AI vào quy trình phát triển phần mềm hiện đại, nâng cao năng suất và chất lượng công việc.</p>
        <ul>
          <li>Ứng dụng thực tế các công cụ AI vào lập trình, sử dụng các nền tảng như GitHub, Jira, Slack với mô hình workflow thực tế từ doanh nghiệp.</li>
          <li>Phát triển skillset chuyên sâu qua thực hành coding, testing, QA, document, planning với sự hỗ trợ từ AI.</li>
          <li>Tối ưu hiệu suất làm việc bằng cách khai thác AI như một "trợ lý mạnh mẽ", giảm công việc lặp lại, tập trung vào phần việc mang tính sáng tạo.</li>
          <li>Mục tiêu hiệu suất: học viên có thể đạt hiệu quả gấp 4 lần so với cách làm truyền thống</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 12 buổi (1 buổi/tuần)</li>
          <li><strong>Hình thức:</strong> Offline tại trung tâm đào tạo</li>
          <li><strong>Phương pháp:</strong> Học qua dự án (Project-based learning)</li>
          <li><strong>Hoạt động:</strong> LMS quiz, thực hành, thuyết trình sản phẩm cuối khóa</li>
          <li><strong>Mentor:</strong> Chuyên gia AI và đội ngũ R&D từ DevPlus</li>
        </ul>
      `,

      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Các học viên làm việc trong lĩnh vực phần mềm và công nghệ thông tin',
      provider: 'Dev Plus',
      url: 'https://learn.devplus.edu.vn/course/view.php?id=32',
      linkImage: 'https://learn.devplus.edu.vn/pluginfile.php/2789/block_html/content/FT02.png',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Công nghệ thông tin',
      sfiaLevels: [SFIALevel.LEVEL_4_INTEGRATION, SFIALevel.LEVEL_5_INNOVATION, SFIALevel.LEVEL_6_LEADERSHIP],
    },
    {
      title: 'APPLY AI FOR DIGITAL MARKETING',
      overview: `
        <p>Khóa học trang bị cho học viên tư duy và kỹ năng thiết yếu để tận dụng sức mạnh của AI trong lĩnh vực Digital Marketing, giúp tối ưu hóa chiến dịch, cá nhân hóa trải nghiệm khách hàng và nâng cao hiệu quả công việc từ đó sẵn sàng thích ứng và dẫn đầu trong môi trường marketing số không ngừng thay đổi</p>`,
      description: `
        <p>Khóa học nâng cao dành cho các học viên marketing đã hoàn thành Challenge Day hoặc chương trình AI-Readiness Mindset (FT01). Khóa học trang bị cho học viên kỹ năng tích hợp AI vào các chiến lược marketing, nâng cao hiệu quả chiến dịch và năng suất vận hành.</p>
        <ul>
          <li>Ứng dụng thực tế các công cụ AI trong quy trình marketing: Sử dụng các công cụ AI tích hợp với các nền tảng như HubSpot, Google Ads, và các công cụ quản lý mạng xã hội để tối ưu hóa lập kế hoạch chiến dịch, phân khúc đối tượng và tạo nội dung.</li>
          <li>Phát triển kỹ năng marketing chuyên sâu: Làm chủ các kỹ thuật sử dụng AI trong tạo nội dung, thử nghiệm A/B, lập bản đồ hành trình khách hàng và phân tích dự đoán thông qua các tình huống marketing thực tế.</li>
          <li>Tối ưu hóa hiệu suất với AI: Tận dụng AI để tự động hóa các công việc lặp lại như phân tích dữ liệu, tạo báo cáo và tối ưu hóa quảng cáo, giúp tiết kiệm thời gian cho các nỗ lực chiến lược và sáng tạo.</li>
          <li>Mục tiêu hiệu suất: Giúp học viên đạt hiệu quả gấp 4 lần so với các phương pháp marketing truyền thống.</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 12 buổi (1 buổi/tuần)</li>
          <li><strong>Hình thức:</strong> Offline tại trung tâm đào tạo</li>
          <li><strong>Phương pháp:</strong> Học qua dự án (Project-based learning)</li>
          <li><strong>Hoạt động:</strong> LMS quiz, thực hành, thuyết trình sản phẩm cuối khóa</li>
          <li><strong>Mentor:</strong> Chuyên gia AI và đội ngũ R&D từ DevPlus</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Học viên làm việc trong lĩnh vực marketing số',
      provider: 'Dev Plus',
      linkImage:
        'https://drive.google.com/drive-viewer/AKGpihbOUaF7bd0WWqSdgB7ga4dsiEjsBpvFWvUqtkFYK4RH8lFvCX6OEHrcaiNWF7h40z9ObEAavGmkXIqmxxAomq_9vqnNmMxknWg=w1920-h963-rw-v1',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Marketing',
      sfiaLevels: [
        SFIALevel.LEVEL_4_INTEGRATION,
        SFIALevel.LEVEL_5_INNOVATION,
        SFIALevel.LEVEL_1_AWARENESS,
        SFIALevel.LEVEL_2_FOUNDATION,
        SFIALevel.LEVEL_3_APPLICATION,
      ],
    },
    {
      title: 'APPLY AI FOR DESIGNER',
      overview: `
        <p>Khóa học chuyên biệt giúp các nhà thiết kế tận dụng sức mạnh của AI để tối ưu hóa quy trình sáng tạo, nâng cao chất lượng thiết kế và tăng năng suất làm việc thông qua việc tích hợp các công cụ AI tiên tiến vào workflow thiết kế chuyên nghiệp</p>`,
      description: `
        <p>Đây là khóa học nâng cao dành cho các nhà thiết kế đã hoàn thành Challenge Day hoặc chương trình AI-Readiness Mindset (FT01). Khóa học giúp học viên hiểu rõ cách tích hợp AI vào quy trình thiết kế hiện đại, nâng cao năng suất sáng tạo và chất lượng đầu ra thiết kế.</p>
        <ul>
          <li>Ứng dụng thực tế các công cụ AI vào thiết kế, sử dụng các nền tảng như Figma, Adobe Creative Suite, Canva với mô hình workflow thiết kế thực tế từ doanh nghiệp.</li>
          <li>Phát triển kỹ năng chuyên sâu qua thực hành: Rèn luyện các kỹ năng nâng cao trong thiết kế UI/UX, thiết kế đồ họa và thiết kế chuyển động với sự hỗ trợ của các công cụ AI trong việc lên ý tưởng, tạo tài nguyên và phân tích phản hồi.</li>
          <li>Tối ưu hóa quy trình sáng tạo với AI: Sử dụng AI như một "trợ lý mạnh mẽ" để tự động hóa các công việc lặp lại, giúp nhà thiết kế tập trung vào các công việc sáng tạo có giá trị cao.</li>
          <li>Mục tiêu hiệu suất: Giúp học viên đạt hiệu quả gấp 4 lần so với các phương pháp thiết kế truyền thống.</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 12 buổi (1 buổi/tuần)</li>
          <li><strong>Hình thức:</strong> Offline tại trung tâm đào tạo</li>
          <li><strong>Phương pháp:</strong> Học qua dự án (Project-based learning)</li>
          <li><strong>Hoạt động:</strong> LMS quiz, thực hành, thuyết trình sản phẩm cuối khóa</li>
          <li><strong>Mentor:</strong> Chuyên gia AI và đội ngũ R&D từ DevPlus</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Các học viên làm việc trong lĩnh vực thiết kế và sáng tạo',
      provider: 'Dev Plus',
      linkImage:
        'https://drive.google.com/drive-viewer/AKGpihYZIlDARdLCDhdSpYhzIMc5lElivWX-w4ODjdGIMBsYP94SsKIN3aUvnVlD_ZK8_-GnsUlDXxkvUJ3zkfs8463fqD3ps_R7xQ=w1375-h963-rw-v1',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Thiết kế sáng tạo',
      sfiaLevels: [
        SFIALevel.LEVEL_4_INTEGRATION,
        SFIALevel.LEVEL_5_INNOVATION,
        SFIALevel.LEVEL_1_AWARENESS,
        SFIALevel.LEVEL_2_FOUNDATION,
        SFIALevel.LEVEL_3_APPLICATION,
      ],
    },
    {
      title: 'APPLY AI FOR BUSINESS ANALYST',
      overview: `
        <p>Khóa học trang bị cho học viên tư duy dữ liệu và kỹ năng chuyên sâu để khai thác AI như một trợ lý đắc lực trong phân tích kinh doanh, giúp tối ưu quy trình, tăng tốc ra quyết định và nâng cao hiệu quả vận hành.</p>`,
      description: `
        <p>Đây là khóa học nâng cao dành cho các nhà phân tích kinh doanh đã hoàn thành Challenge Day hoặc chương trình AI-Readiness Mindset (FT01). Khóa học tập trung vào việc tích hợp AI vào các quy trình phân tích kinh doanh để nâng cao khả năng ra quyết định dựa trên dữ liệu và hiệu quả vận hành.</p>
        <ul>
          <li>Áp dụng các công cụ AI trong các nền tảng như Tableau, Power BI và Jira để tối ưu hóa phân tích dữ liệu, thu thập yêu cầu và giao tiếp với các bên liên quan trong các kịch bản kinh doanh thực tế.</li>
          <li>Rèn luyện chuyên môn trong mô hình hóa dữ liệu, dự báo, tối ưu hóa quy trình và tạo báo cáo với sự hỗ trợ của AI để hỗ trợ các quyết định kinh doanh chiến lược.</li>
          <li>Sử dụng AI như một "trợ lý mạnh mẽ" để tự động hóa các công việc như làm sạch dữ liệu, xác định xu hướng và lập tài liệu, giúp nhà phân tích tập trung vào việc cung cấp những hiểu biết giá trị cao.</li>
          <li>Mục tiêu hiệu suất: Giúp học viên đạt hiệu quả gấp 4 lần so với các phương pháp truyền thống.</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 12 buổi (1 buổi/tuần)</li>
          <li><strong>Hình thức:</strong> Offline tại trung tâm đào tạo</li>
          <li><strong>Phương pháp:</strong> Học qua dự án (Project-based learning)</li>
          <li><strong>Hoạt động:</strong> LMS quiz, thực hành, thuyết trình sản phẩm cuối khóa</li>
          <li><strong>Mentor:</strong> Chuyên gia AI và đội ngũ R&D từ DevPlus</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Các học viên làm việc trong lĩnh vực phân tích kinh doanh và ra quyết định dựa trên dữ liệu',
      provider: 'Dev Plus',
      linkImage:
        'https://drive.google.com/drive-viewer/AKGpihYUZ9FZroBTdO8APvlsDew6eUHyHCsDDCtGBi11XpZ0b0invOqGewk9Fvv8H6ncnBklSk35vI1nYiergie2gYd7qEpbkgdIFMU=w1375-h963-rw-v1',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Phân tích nghiệp vụ (BA)',
      sfiaLevels: [
        SFIALevel.LEVEL_4_INTEGRATION,
        SFIALevel.LEVEL_5_INNOVATION,
        SFIALevel.LEVEL_1_AWARENESS,
        SFIALevel.LEVEL_2_FOUNDATION,
        SFIALevel.LEVEL_3_APPLICATION,
      ],
    },
    {
      title: 'READY TO WORK IN SINGAPORE',
      overview: `
        <p>Chương trình chuẩn bị toàn diện giúp học viên trang bị kỹ năng chuyên môn, ngôn ngữ và văn hóa làm việc cần thiết để sẵn sàng làm việc tại thị trường Singapore, một trong những trung tâm công nghệ hàng đầu Đông Nam Á</p>`,
      description: `
        <p>Chương trình đào tạo chuyên biệt giúp học viên chuẩn bị đầy đủ kỹ năng và kiến thức cần thiết để thành công trong môi trường làm việc tại Singapore. Khóa học kết hợp giữa nâng cao kỹ năng chuyên môn, phát triển khả năng tiếng Anh chuyên ngành và hiểu biết về văn hóa doanh nghiệp Singapore.</p>
        <ul>
          <li>Nâng cao kỹ năng chuyên môn theo tiêu chuẩn quốc tế và yêu cầu thị trường Singapore.</li>
          <li>Phát triển tiếng Anh chuyên ngành IT và kỹ năng giao tiếp trong môi trường đa văn hóa.</li>
          <li>Hiểu biết về văn hóa làm việc, quy trình và tiêu chuẩn chuyên nghiệp tại Singapore.</li>
          <li>Kết nối với mạng lưới doanh nghiệp và cơ hội việc làm tại Singapore.</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 3 tháng</li>
          <li><strong>Hình thức:</strong> Hybrid</li>
          <li><strong>Phương pháp:</strong> Dự án thực tế & case study từ doanh nghiệp Singapore</li>
          <li><strong>Hoạt động:</strong> Workshop kỹ năng mềm, mock interview, networking events</li>
          <li><strong>Mentor:</strong> Chuyên gia đang làm việc tại Singapore và đội ngũ tư vấn quốc tế</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Sinh viên, người đi làm muốn tích lũy kinh nghiệm thực tế đa quốc gia',
      provider: 'Dev Plus',
      linkImage:
        'https://drive.google.com/drive-viewer/AKGpihb0SJSFcLtBCLGWg8UzpUSOWWuIECaH2IduwqUJZlFD1oDv7UXUljw10wwyLuvEVa9oZS_Adp7od_MtrYFNP5qUHvFUDX1-f7A=w1375-h963-rw-v1',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      sfiaLevels: [
        SFIALevel.LEVEL_4_INTEGRATION,
        SFIALevel.LEVEL_5_INNOVATION,
        SFIALevel.LEVEL_1_AWARENESS,
        SFIALevel.LEVEL_2_FOUNDATION,
        SFIALevel.LEVEL_3_APPLICATION,
      ],
    },
    {
      title: 'READY TO WORK IN KOREA',
      overview: `
        <p>Chương trình đào tạo chuyên sâu giúp học viên rèn luyện kỹ năng chuyên môn và kỹ năng mềm theo tiêu chuẩn Hàn Quốc, đồng thời trang bị kiến thức về văn hóa doanh nghiệp và ngôn ngữ cần thiết để làm việc hiệu quả trong ngành công nghệ tại Hàn Quốc</p>`,
      description: `
        <p>Chương trình toàn diện chuẩn bị cho học viên những kiến thức và kỹ năng cần thiết để làm việc hiệu quả tại các công ty công nghệ Hàn Quốc. Khóa học đặc biệt chú trọng đến văn hóa làm việc đặc trưng của Hàn Quốc và các yêu cầu kỹ thuật cao của thị trường này.</p>
        <ul>
          <li>Nâng cao kỹ năng lập trình theo tiêu chuẩn và công nghệ phổ biến tại Hàn Quốc.</li>
          <li>Học tiếng Hàn chuyên ngành IT và thuật ngữ kỹ thuật cần thiết.</li>
          <li>Hiểu biết sâu về văn hóa doanh nghiệp Hàn Quốc.</li>
          <li>Thực hành với các framework và methodology phổ biến tại các công ty Hàn Quốc.</li>
          <li>Kết nối với cộng đồng người Việt và cơ hội việc làm tại Hàn Quốc.</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 3 tháng</li>
          <li><strong>Hình thức:</strong> Làm việc thực tế có giám sát & hỗ trợ toàn thời gian</li>
          <li><strong>Phương pháp:</strong> Làm việc thực tế, được kèm cặp bởi mentor & supervisor</li>
          <li><strong>Hoạt động:</strong> Thực hành, dự án thực tế</li>
          <li><strong>Mentor:</strong> Chuyên gia AI và đội ngũ R&D từ DevPlus</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Sinh viên, người đi làm muốn tích lũy kinh nghiệm thực tế đa quốc gia',
      provider: 'Dev Plus',
      linkImage:
        'https://drive.google.com/drive-viewer/AKGpihYHrJG5Jal2Fu_NoP2voM101sYIpbp0fD23KQpFXnD2HRtPVlNF24NWcvRHUXZWGVh5EW9HCwRqGdUHlh0UbbNjD0UHUbEUGw=w1375-h963-rw-v1',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      sfiaLevels: [
        SFIALevel.LEVEL_4_INTEGRATION,
        SFIALevel.LEVEL_5_INNOVATION,
        SFIALevel.LEVEL_1_AWARENESS,
        SFIALevel.LEVEL_2_FOUNDATION,
        SFIALevel.LEVEL_3_APPLICATION,
      ],
    },
    {
      title: 'MentorME',
      overview: `
        <p>Chương trình mentorship cá nhân hóa kết nối trực tiếp sinh viên với các chuyên gia đang làm việc trong ngành công nghệ, tạo cơ hội học hỏi kinh nghiệm thực tế, phát triển kỹ năng và xây dựng network chuyên nghiệp</p>`,
      description: `
        <p>Mentor Me là chương trình kết nối sinh viên với các mentor đang làm việc trong ngành công nghệ nhằm định hướng nghề nghiệp, phát triển kỹ năng và xây dựng tư duy sẵn sàng cho công việc thực tế.</p>
        <ul>
          <li>Mục tiêu: Giúp sinh viên trải nghiệm môi trường làm việc thực tế, rèn luyện technical skills & soft skills, đồng thời chuẩn bị hành trang trước khi gia nhập thị trường lao động.</li>
          <li>Lợi ích: Trải nghiệm môi trường chuyên nghiệp, nhận feedback trực tiếp từ Mentor & doanh nghiệp, mở rộng cơ hội kết nối với nhà tuyển dụng tiềm năng.</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 2 - 3 tháng</li>
          <li><strong>Hình thức:</strong> Kèm cặp 1:1 hoặc 1 mentor với 1 team mentee</li>
          <li><strong>Phương pháp:</strong> Trao đổi cá nhân, thử thách phát triển kỹ năng, phản hồi chuyên sâu</li>
          <li><strong>Hoạt động:</strong> Thử thách kỹ năng, phản hồi từ mentor</li>
          <li><strong>Mentor:</strong> Chuyên gia đang làm việc trong ngành công nghệ</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Sinh viên đại học, cao đẳng muốn tích lũy kinh nghiệm thực tế',
      provider: 'Dev Plus',
      linkImage:
        'https://drive.google.com/drive-viewer/AKGpihZ2UOtVfeJckpjknC98EUaEsxKG_5J1plOW0ia1Bpv_m60lJK4vw5h7s_Cwe3T6TuvbMTx1_r1O8YJYV1qzieKVCT8sNWf7kUk=w1375-h963-rw-v1',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      sfiaLevels: [
        SFIALevel.LEVEL_4_INTEGRATION,
        SFIALevel.LEVEL_5_INNOVATION,
        SFIALevel.LEVEL_1_AWARENESS,
        SFIALevel.LEVEL_2_FOUNDATION,
        SFIALevel.LEVEL_3_APPLICATION,
      ],
    },
    {
      title: 'On Job Training',
      overview: `
        <p>Chương trình thực tập chuyên nghiệp tại doanh nghiệp đối tác, mang đến trải nghiệm làm việc 100% thực tế với sự hướng dẫn sát sao từ mentor, giúp sinh viên chuyển đổi từ môi trường học tập sang môi trường làm việc chuyên nghiệp</p>`,
      description: `
        <p>On Job Training (OJT) là chương trình thực tập trực tiếp tại doanh nghiệp, nơi sinh viên được tham gia vào các dự án thực tế với sự hướng dẫn sát sao từ mentor, giúp nâng cao kỹ năng và kinh nghiệm làm việc.</p>
        <ul>
          <li>Mục tiêu: Giúp sinh viên trải nghiệm môi trường làm việc thực tế, rèn luyện technical skills & soft skills, đồng thời chuẩn bị hành trang trước khi gia nhập thị trường lao động.</li>
          <li>Lợi ích: Trải nghiệm môi trường chuyên nghiệp, nhận feedback trực tiếp từ Mentor & doanh nghiệp, mở rộng cơ hội kết nối với nhà tuyển dụng tiềm năng.</li>
        </ul>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> 2 tháng (Full-time, Thứ 2 - Thứ 6)</li>
          <li><strong>Hình thức:</strong> Làm việc trực tiếp tại doanh nghiệp</li>
          <li><strong>Phương pháp:</strong> Thực tập thực tế dưới sự hướng dẫn của mentor</li>
          <li><strong>Hoạt động:</strong> Dự án thực tế, phản hồi từ mentor</li>
          <li><strong>Mentor:</strong> Chuyên gia từ doanh nghiệp đối tác</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects: 'Sinh viên đại học, cao đẳng muốn tích lũy kinh nghiệm thực tế',
      provider: 'Dev Plus',
      linkImage:
        'https://drive.google.com/drive-viewer/AKGpihZt4usPR17Oj_H5j757NAx48uC1dxvB8tSQnT2OuZaKatAs-KTusbwjxC73v1QSNWzFX5LnLW77DAAarM-6ElUa5rMP6oc33GI=w1375-h963-rw-v1',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      sfiaLevels: [
        SFIALevel.LEVEL_4_INTEGRATION,
        SFIALevel.LEVEL_5_INNOVATION,
        SFIALevel.LEVEL_1_AWARENESS,
        SFIALevel.LEVEL_2_FOUNDATION,
        SFIALevel.LEVEL_3_APPLICATION,
      ],
    },
    {
      title: 'Hybrid Training',
      overview: `
        <p>Chương trình đào tạo độc đáo kết hợp giữa học tập lý thuyết tại trường đại học và thực hành thực tế tại doanh nghiệp, mang đến trải nghiệm học tập toàn diện theo mô hình giáo dục hiện đại nhất</p>`,
      description: `
        <p>Hybrid Training là chương trình đào tạo kết hợp giữa việc giảng dạy lý thuyết và thực hành thực tế. Các bạn sinh viên tham gia chương trình Hybrid Training tại Dev Plus sẽ được chuyên gia giảng dạy lý thuyết tại trường đại học và thực hành làm task tại 20 doanh nghiệp là đối tác của Dev Plus.</p>
        <p>Chương trình được triển khai theo mô hình Agile Team, với sự đồng hành và hướng dẫn trực tiếp từ các mentor. Kết quả đánh giá được xác định thông qua Release Day, diễn ra tại doanh nghiệp và Mentor sẽ chấm điểm dựa trên quá trình làm việc thực tế của từng sinh viên.</p>
      `,
      courseInformation: `
        <ul>
          <li><strong>Thời lượng:</strong> Không xác định (tùy thuộc vào chương trình)</li>
          <li><strong>Hình thức:</strong> Hybrid</li>
          <li><strong>Phương pháp:</strong> Agile methodology, team-based learning</li>
          <li><strong>Hoạt động:</strong> Lý thuyết tại trường, thực hành tại doanh nghiệp, Release Day</li>
          <li><strong>Mentor:</strong> Chuyên gia từ DevPlus và doanh nghiệp đối tác</li>
        </ul>
      `,
      contactInformation: `
        <ul>
          <li><strong>Email:</strong> hello@devplus.edu.vn</li>
          <li><strong>Số điện thoại:</strong> 093 190 1608</li>
          <li><strong>Địa chỉ:</strong> 116 - 118 Mai Thúc Lân, Mỹ An, Ngũ Hành Sơn, Đà Nẵng</li>
          <li><strong>Website:</strong> <a href="https://devplus.edu.vn">https://devplus.edu.vn</a></li>
        </ul>
      `,
      applicableObjects:
        'Sinh viên đại học đang theo học các chuyên ngành liên quan đến IT, muốn kết hợp học tập lý thuyết với thực hành thực tế tại doanh nghiệp trong thời gian học',
      provider: 'Dev Plus',
      linkImage:
        'https://drive.google.com/drive-viewer/AKGpihZNn_mcnmdx76wkdzaxGwMC3ceeGpVBxcCKMkAsdmICvmc58xGJMJWDmxtsXUcuqv-ljYJCpLEYF9MkoyaGVjAKzDR69yTtzw=w1375-h963-rw-v1',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Công nghệ thông tin',
      sfiaLevels: [
        SFIALevel.LEVEL_4_INTEGRATION,
        SFIALevel.LEVEL_5_INNOVATION,
        SFIALevel.LEVEL_1_AWARENESS,
        SFIALevel.LEVEL_2_FOUNDATION,
        SFIALevel.LEVEL_3_APPLICATION,
      ],
    },
  ];

  await prisma.course.createMany({
    data: coursesData.map((courseData) => ({
      title: courseData.title,
      overview: courseData.overview,
      description: courseData.description,
      courseInformation: courseData.courseInformation,
      contactInformation: courseData.contactInformation,
      applicableObjects: courseData.applicableObjects,
      provider: courseData.provider,
      url: courseData.url && null,
      linkImage: courseData.linkImage || null,
      aspectId: categoryMap[courseData.category].id,
      domainId: courseData.domain ? domainMap[courseData.domain].id : null,
      sfiaLevels: courseData.sfiaLevels ?? [],
    })),
  });
}
