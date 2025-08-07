import { PrismaClient, QuestionType, Level, CompetencySkill, SFIALevel } from '@prisma/client';

export async function seedQuestions(prisma: PrismaClient, levels: Level[], competencySkills: CompetencySkill[]) {
  const levelsMap = Object.fromEntries(levels.map((c) => [c.sfiaLevel, c]));
  const competenciesSkillMap = Object.fromEntries(competencySkills.map((c) => [c.name, c]));

  // const questionsData = [
  //   // A1. KHẢ NĂNG THÍCH ỨNG & TƯ DUY PHÁT TRIỂN
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content: 'AI đang thay đổi thế giới công việc. Cách tiếp cận hiệu quả nhất cho người mới bắt đầu là gì?',
  //   //   level: SFIALevel.LEVEL_1_AWARENESS,
  //   //   competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 1)',
  //   //   estimatedTimeMinutes: 1,
  //   //   difficultyWeight: 1,
  //   //   answerOptions: [
  //   //     {
  //   //       content: 'Tập trung vào việc nâng cao kỹ năng chuyên môn hiện tại vì AI chỉ là công cụ hỗ trợ',
  //   //       isCorrect: false,
  //   //     },
  //   //     {
  //   //       content: 'Bắt đầu tìm hiểu các công cụ AI cơ bản để hiểu cách chúng có thể tăng cường công việc',
  //   //       isCorrect: true,
  //   //     },
  //   //     { content: 'Theo dõi xu hướng AI qua các nguồn tin tức và chờ đợi hướng dẫn từ tổ chức', isCorrect: false },
  //   //     { content: 'Nghiên cứu kỹ về lý thuyết AI trước khi thử nghiệm bất kỳ ứng dụng nào', isCorrect: false },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.MULTIPLE_CHOICE,
  //     content:
  //       'Công ty bạn vừa triển khai Claude cho toàn bộ nhân viên. Một số đồng nghiệp lo lắng AI sẽ thay thế họ. Là người đã có kinh nghiệm AI, bạn sẽ làm gì? (Chọn các hành động tích cực)',
  //     level: SFIALevel.LEVEL_3_APPLICATION,
  //     competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 3)',
  //     estimatedTimeMinutes: 3,
  //     difficultyWeight: 3,
  //     answerOptions: [
  //       {
  //         content: 'Tổ chức buổi thảo luận để nghe lo ngại và cùng nghiên cứu về tác động AI trong ngành',
  //         isCorrect: true,
  //       },
  //       {
  //         content:
  //           'Hướng dẫn đồng nghiệp sử dụng Claude để nâng cao công việc hiện tại và thử nghiệm các trường hợp sử dụng mới',
  //         isCorrect: true,
  //       },
  //       {
  //         content:
  //           'Chia sẻ các nghiên cứu tình huống (case studies) và thực hành tốt nhất từ các công ty đã thành công với chuyển đổi AI',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Đề xuất với ban quản lý tổ chức chương trình đào tạo toàn diện về AI cho toàn đội',
  //         isCorrect: true,
  //       },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Bạn là Giám đốc Đổi mới của công ty 5000 nhân viên. Ban lãnh đạo muốn "chuyển đổi AI" nhưng chưa có định hướng chiến lược. Phương pháp tiếp cận của bạn?',
  //     level: SFIALevel.LEVEL_5_INNOVATION,
  //     competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 5)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 5,
  //     answerOptions: [
  //       {
  //         content: 'Triển khai các công cụ AI quy mô rộng và đo lường chỉ số áp dụng để chứng minh giá trị',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Phát triển chiến lược AI toàn diện: đánh giá hiện trạng, phân loại ưu tiên các trường hợp sử dụng, trung tâm xuất sắc, quản lý thay đổi có cấu trúc',
  //         isCorrect: true,
  //       },
  //       {
  //         content:
  //           'Hợp tác với các nhà cung cấp AI hàng đầu để triển khai các giải pháp đã được chứng minh từ những công ty dẫn đầu ngành',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Tập trung vào các dự án thử nghiệm có tác động cao để chứng minh lợi tức đầu tư (ROI) trước khi mở rộng toàn tổ chức',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Với tư cách là người dẫn dắt tư tưởng về chuyển đổi AI trong ngành logistics Việt Nam, bạn thấy các công ty đang áp dụng AI một cách phân mảnh và không hiệu quả. Chiến lược để định hình sự thích ứng toàn ngành?',
  //     level: SFIALevel.LEVEL_7_MASTERY,
  //     competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 7)',
  //     estimatedTimeMinutes: 6,
  //     difficultyWeight: 7,
  //     answerOptions: [
  //       {
  //         content:
  //           'Thiết lập vị thế dẫn dắt tư tưởng qua các ấn phẩm và hoạt động diễn thuyết để tác động đến định hướng thị trường',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Xây dựng liên minh ngành, phát triển khung chuyển đổi chung, tạo ra các tiêu chuẩn, hợp tác với chính phủ và các trường đại học để phát triển hệ sinh thái',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Khởi động dịch vụ tư vấn để hỗ trợ trực tiếp các công ty với các phương pháp đã được chứng minh',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Hợp tác với các nhà cung cấp công nghệ để tạo ra các giải pháp chuyên biệt cho ngành và chiến lược tiếp cận thị trường',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   // A2. TỰ HỌC & CẢI TIẾN LIÊN TỤC
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content: 'Tại sao việc cập nhật kiến thức về AI quan trọng đối với các chuyên gia?',
  //   //   level: SFIALevel.LEVEL_1_AWARENESS,
  //   //   competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 1)',
  //   //   estimatedTimeMinutes: 1,
  //   //   difficultyWeight: 1,
  //   //   answerOptions: [
  //   //     {
  //   //       content: 'Công nghệ AI phát triển nhanh chóng và tác động đến hầu hết các ngành và chức năng công việc',
  //   //       isCorrect: true,
  //   //     },
  //   //     {
  //   //       content: 'Các công ty ngày càng kỳ vọng nhân viên có hiểu biết cơ bản về các công cụ hiện đại',
  //   //       isCorrect: false,
  //   //     },
  //   //     {
  //   //       content: 'Kiến thức AI đang trở thành yêu cầu tiêu chuẩn cho các cơ hội thăng tiến nghề nghiệp',
  //   //       isCorrect: false,
  //   //     },
  //   //     { content: 'Xu hướng công nghệ luôn có tính chu kỳ nên quan trọng để đi trước đường cong', isCorrect: false },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.MULTIPLE_CHOICE,
  //     content:
  //       'Bạn muốn cập nhật các phát triển AI với tư cách sinh viên. Phương pháp bền vững nào? (Chọn các phương án thực tế)',
  //     level: SFIALevel.LEVEL_2_FOUNDATION,
  //     competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 2)',
  //     estimatedTimeMinutes: 2,
  //     difficultyWeight: 2,
  //     answerOptions: [
  //       { content: 'Đăng ký 2-3 bản tin AI chất lượng cao và các nguồn nội dung được tuyển chọn', isCorrect: true },
  //       { content: 'Tham gia các cộng đồng AI để tham gia thảo luận và học hỏi từ đồng nghiệp', isCorrect: true },
  //       { content: 'Phân bổ thời gian hàng tuần để thử nghiệm với các công cụ và tính năng AI mới', isCorrect: true },
  //       {
  //         content:
  //           'Theo dõi các nhà nghiên cứu và thực hành AI trên mạng xã hội để có thông tin chi tiết thời gian thực',
  //         isCorrect: true,
  //       },
  //       { content: 'Tập trung độc quyền vào các bài báo học thuật để đảm bảo hiểu biết nghiêm ngặt', isCorrect: false },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Đội cần triển khai GPT-4 cho dịch vụ khách hàng, nhưng chỉ có kinh nghiệm với chatbot cơ bản. Có 3 tháng chuẩn bị. Chiến lược học tập?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       { content: 'Tập trung chuyên sâu vào tài liệu GPT-4 và thông số kỹ thuật', isCorrect: false },
  //       {
  //         content: 'Lộ trình học có cấu trúc: Nền tảng LLM → kỹ thuật tạo lệnh → mẫu tích hợp → thử nghiệm thí điểm',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Thuê các chuyên gia tư vấn bên ngoài để xử lý việc triển khai trong khi đội quan sát',
  //         isCorrect: false,
  //       },
  //       { content: 'Bắt đầu triển khai ngay lập tức với phương pháp học qua thực hành và lặp lại', isCorrect: false },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content: 'Giám đốc Học tập cần tạo ra văn hóa học tập AI cho 10.000 nhân viên đa dạng. Phương pháp tiếp cận?',
  //     level: SFIALevel.LEVEL_6_LEADERSHIP,
  //     competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 6)',
  //     estimatedTimeMinutes: 5,
  //     difficultyWeight: 6,
  //     answerOptions: [
  //       {
  //         content:
  //           'Triển khai nền tảng học trực tuyến toàn diện với chương trình giảng dạy AI tiêu chuẩn cho tất cả vai trò',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Thiết lập Hệ sinh thái Học tập AI: lộ trình theo vai trò, cộng đồng thực hành, văn hóa thử nghiệm, chương trình cố vấn, đo lường tác động',
  //         isCorrect: true,
  //       },
  //       { content: 'Tập trung vào đào tạo lãnh đạo để truyền tải kiến thức AI qua hệ thống quản lý', isCorrect: false },
  //       {
  //         content:
  //           'Tạo ra các trung tâm xuất sắc trong các phòng ban chính để thúc đẩy việc áp dụng AI một cách tự nhiên',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   // A3. TƯ DUY PHẢN BIỆN & LÝ LUẬN ĐẠO ĐỨC
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content: 'Khi các hệ thống AI đưa ra quyết định bất công, nguyên nhân gốc thường là gì?',
  //   //   level: SFIALevel.LEVEL_1_AWARENESS,
  //   //   competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 1)',
  //   //   estimatedTimeMinutes: 1,
  //   //   difficultyWeight: 1,
  //   //   answerOptions: [
  //   //     { content: 'Dữ liệu huấn luyện phản ánh sự bất bình đẳng lịch sử và các mẫu xã hội', isCorrect: true },
  //   //     {
  //   //       content: 'Các thuật toán AI được thiết kế với sở thích cố hữu cho một số kết quả nhất định',
  //   //       isCorrect: false,
  //   //     },
  //   //     { content: 'Sức mạnh xử lý máy tính không đủ để xử lý việc ra quyết định phức tạp', isCorrect: false },
  //   //     { content: 'Các hệ thống AI thiếu bối cảnh thế giới thực về sự tinh tế xã hội và văn hóa', isCorrect: false },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content: 'Sử dụng ChatGPT để hỗ trợ viết luận cho bài tập học thuật. Phương pháp phù hợp?',
  //     level: SFIALevel.LEVEL_2_FOUNDATION,
  //     competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
  //     estimatedTimeMinutes: 2,
  //     difficultyWeight: 2,
  //     answerOptions: [
  //       {
  //         content:
  //           'Sử dụng ChatGPT cho ý tưởng và nghiên cứu, viết nội dung gốc với việc công bố rõ ràng việc sử dụng AI',
  //         isCorrect: true,
  //       },
  //       {
  //         content:
  //           'Tạo bản thảo ban đầu với sự hỗ trợ của AI, chỉnh sửa đáng kể với những hiểu biết cá nhân và trích dẫn đóng góp AI',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Sử dụng ChatGPT hoàn toàn để kiểm tra ngữ pháp và cải thiện cấu trúc của nội dung tự viết',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Hợp tác với ChatGPT như một đồng tác giả, thừa nhận đóng góp trong thư mục tham khảo',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   {
  //     type: QuestionType.MULTIPLE_CHOICE,
  //     content:
  //       'Công cụ tuyển dụng AI thể hiện thiên kiến chống lại ứng viên từ một số nhóm dân tộc nhất định. Phản ứng đạo đức? (Chọn các hành động phù hợp)',
  //     level: SFIALevel.LEVEL_3_APPLICATION,
  //     competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 3)',
  //     estimatedTimeMinutes: 3,
  //     difficultyWeight: 3,
  //     answerOptions: [
  //       {
  //         content:
  //           'Ngay lập tức tạm dừng sử dụng công cụ cho quyết định tuyển dụng và tiến hành kiểm toán thiên kiến toàn diện',
  //         isCorrect: true,
  //       },
  //       { content: 'Điều tra các nguồn dữ liệu huấn luyện và quy trình ra quyết định thuật toán', isCorrect: true },
  //       {
  //         content: 'Phát triển các quy trình phát hiện thiên kiến cho việc triển khai công cụ AI trong tương lai',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Tiếp tục sử dụng nhưng thêm lớp xem xét thủ công cho các nhóm nhân khẩu học bị ảnh hưởng',
  //         isCorrect: false,
  //       },
  //       { content: 'Ghi chép các phát hiện và chia sẻ với các ứng viên bị ảnh hưởng khi thích hợp', isCorrect: true },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Hệ thống chẩn đoán AI: độ chính xác tổng thể 94% nhưng 78% cho bệnh nhân cao tuổi. Đội ngũ y tế muốn triển khai ngay lập tức do áp lực chi phí. Phản ứng?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       {
  //         content: 'Triển khai với tài liệu toàn diện về các hạn chế và xem xét bắt buộc của bác sĩ',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Triển khai theo giai đoạn với giám sát của con người được tăng cường cho bệnh nhân cao tuổi và giám sát liên tục',
  //         isCorrect: true,
  //       },
  //       {
  //         content:
  //           'Trì hoãn triển khai cho đến khi đạt được sự ngang bằng độ chính xác trên tất cả các nhóm nhân khẩu học',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Triển khai cho bệnh nhân không cao tuổi ban đầu với việc mở rộng dần dần khi hệ thống cải thiện',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Lãnh đạo đạo đức AI cho công ty xe tự lái đa quốc gia. Các quốc gia khác nhau có các giá trị văn hóa khác nhau về việc ra quyết định tai nạn. Phương pháp khung đạo đức?',
  //     level: SFIALevel.LEVEL_5_INNOVATION,
  //     competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 5)',
  //     estimatedTimeMinutes: 5,
  //     difficultyWeight: 5,
  //     answerOptions: [
  //       {
  //         content: 'Triển khai các nguyên tắc đạo đức phổ quát bất kể các biến thể văn hóa địa phương',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Thiết kế các khung thích ứng văn hóa duy trì các nguyên tắc an toàn cốt lõi với sự tham gia của các bên liên quan',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Cho phép các đội khu vực phát triển các hướng dẫn đạo đức độc lập dựa trên các giá trị địa phương',
  //         isCorrect: false,
  //       },
  //       { content: 'Tập trung độc quyền vào tối ưu hóa an toàn kỹ thuật, tránh lập trình đạo đức', isCorrect: false },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Giám đốc AI thiết lập quản trị AI trên toàn tổ chức 50.000 nhân viên với các đơn vị kinh doanh đa dạng (chăm sóc sức khỏe, tài chính, sản phẩm tiêu dùng). Lợi ích của các bên liên quan mâu thuẫn. Chiến lược quản trị?',
  //     level: SFIALevel.LEVEL_6_LEADERSHIP,
  //     competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 6)',
  //     estimatedTimeMinutes: 5,
  //     difficultyWeight: 6,
  //     answerOptions: [
  //       {
  //         content:
  //           'Triển khai các chính sách thống nhất trên tất cả các đơn vị kinh doanh với các yêu cầu tuân thủ rõ ràng',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Tạo ra khung quản trị thích ứng với các nguyên tắc cốt lõi, hướng dẫn riêng cho từng lĩnh vực, và cơ chế đại diện của các bên liên quan',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Cho phép các đơn vị kinh doanh tự điều chỉnh dựa trên các tiêu chuẩn ngành tương ứng của họ',
  //         isCorrect: false,
  //       },
  //       { content: 'Tập trung chủ yếu vào tuân thủ quy định để giảm thiểu rủi ro pháp lý', isCorrect: false },
  //     ],
  //   },
  //   // A4. TRÍ TUỆ RANH GIỚI CON NGƯỜI-AI
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content:
  //   //     'Trong bối cảnh kinh doanh, khi nào việc giám sát của con người đối với các quyết định AI quan trọng nhất?',
  //   //   level: SFIALevel.LEVEL_1_AWARENESS,
  //   //   competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 1)',
  //   //   estimatedTimeMinutes: 1,
  //   //   difficultyWeight: 1,
  //   //   answerOptions: [
  //   //     {
  //   //       content: 'Khi các quyết định có tác động đáng kể đến phúc lợi, an toàn hoặc cơ hội sống của con người',
  //   //       isCorrect: true,
  //   //     },
  //   //     { content: 'Khi điểm tin cậy AI giảm xuống dưới ngưỡng được xác định trước', isCorrect: false },
  //   //     {
  //   //       content: 'Khi xử lý các giao dịch tài chính có giá trị cao hoặc quyết định kinh doanh chiến lược',
  //   //       isCorrect: false,
  //   //     },
  //   //     {
  //   //       content: 'Khi các hệ thống AI mới được triển khai và chưa có hồ sơ theo dõi đã được chứng minh',
  //   //       isCorrect: false,
  //   //     },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'ChatGPT khuyến nghị quyết định tài chính lớn cho công ty khởi nghiệp (đầu tư marketing 500 triệu VNĐ). Phương pháp phù hợp?',
  //     level: SFIALevel.LEVEL_2_FOUNDATION,
  //     competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 2)',
  //     estimatedTimeMinutes: 2,
  //     difficultyWeight: 2,
  //     answerOptions: [
  //       {
  //         content: 'Triển khai khuyến nghị sau khi xác thực các nguồn dữ liệu và phương pháp lý luận của AI',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Sử dụng như đầu vào phân tích để đánh giá thêm với các chuyên gia lĩnh vực và cố vấn tài chính',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Yêu cầu AI cung cấp phân tích chi phí-lợi ích chi tiết trước khi đưa ra quyết định cuối cùng',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Kết hợp khuyến nghị AI với nghiên cứu thị trường bổ sung và tham vấn các bên liên quan',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Hệ thống HR AI đề xuất từ chối tất cả ứng viên từ một trường đại học cụ thể dựa trên "dữ liệu hiệu suất lịch sử." Với tư cách quản lý tuyển dụng, phản ứng?',
  //     level: SFIALevel.LEVEL_3_APPLICATION,
  //     competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 3)',
  //     estimatedTimeMinutes: 3,
  //     difficultyWeight: 3,
  //     answerOptions: [
  //       {
  //         content: 'Tin tưởng phân tích AI vì các quyết định dựa trên dữ liệu loại bỏ thiên kiến của con người',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Điều tra lý luận đằng sau khuyến nghị, kiểm toán thiên kiến tiềm ẩn, đánh giá công đức cá nhân',
  //         isCorrect: true,
  //       },
  //       { content: 'Ghi đè khuyến nghị AI và phỏng vấn ứng viên để đưa ra đánh giá độc lập', isCorrect: false },
  //       { content: 'Yêu cầu thêm các chỉ số hiệu suất để xác thực kết luận phân tích của AI', isCorrect: false },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Thiết kế hệ thống AI cho phê duyệt khoản vay ngân hàng (100 triệu - 10 tỷ VNĐ). Thiết lập ranh giới hiệu quả giữa con người và AI?',
  //     level: SFIALevel.LEVEL_5_INNOVATION,
  //     competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 5)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 5,
  //     answerOptions: [
  //       {
  //         content: 'AI xử lý tất cả quyết định với việc xem xét của con người chỉ cho các trường hợp tranh chấp',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Khung quyết định phân tầng rủi ro: AI tự động phê duyệt cho các trường hợp rủi ro thấp/tin cậy cao, xem xét của con người cho các trường hợp giá trị cao/không chắc chắn, duy trì quyền phủ quyết của con người',
  //         isCorrect: true,
  //       },
  //       { content: 'Quyết định của con người với AI cung cấp khuyến nghị và phân tích hỗ trợ', isCorrect: false },
  //       {
  //         content: 'AI sàng lọc sơ bộ với các đội con người đưa ra tất cả quyết định phê duyệt cuối cùng',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   // A5. NHẬN THỨC RỦI RO & QUẢN TRỊ AI
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content: 'Mối quan tâm chính khi sử dụng các công cụ AI công cộng (ChatGPT) với dữ liệu công ty?',
  //   //   level: SFIALevel.LEVEL_1_AWARENESS,
  //   //   competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 1)',
  //   //   estimatedTimeMinutes: 1,
  //   //   difficultyWeight: 1,
  //   //   answerOptions: [
  //   //     { content: 'Khả năng lộ thông tin nhạy cảm cho các hệ thống bên thứ ba', isCorrect: true },
  //   //     {
  //   //       content: 'Sự không chính xác trong phản hồi AI dẫn đến thông tin sai lệch trong kinh doanh',
  //   //       isCorrect: false,
  //   //     },
  //   //     {
  //   //       content: 'Sự phụ thuộc vào các hệ thống bên ngoài cho các quy trình kinh doanh quan trọng',
  //   //       isCorrect: false,
  //   //     },
  //   //     { content: 'Chi phí liên quan đến đăng ký premium và các tính năng doanh nghiệp', isCorrect: false },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.MULTIPLE_CHOICE,
  //     content:
  //       'Công ty triển khai AI cho dịch vụ khách hàng. Các chính sách sử dụng thiết yếu? (Chọn các chính sách quan trọng)',
  //     level: SFIALevel.LEVEL_2_FOUNDATION,
  //     competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 2)',
  //     estimatedTimeMinutes: 2,
  //     difficultyWeight: 2,
  //     answerOptions: [
  //       { content: 'Hạn chế nhập thông tin nhận dạng cá nhân vào các hệ thống AI công cộng', isCorrect: true },
  //       { content: 'Duy trì các quy trình dự phòng khi các hệ thống AI gặp sự cố ngừng hoạt động', isCorrect: true },
  //       { content: 'Công bố rõ ràng khi khách hàng tương tác với AI so với đại diện con người', isCorrect: true },
  //       {
  //         content: 'Giới hạn việc sử dụng AI trong giờ làm việc để đảm bảo có sự giám sát của con người',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Xem xét và cập nhật thường xuyên các phản hồi AI về độ chính xác và tính phù hợp',
  //         isCorrect: true,
  //       },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Triển khai AI trong quy trình tuyển dụng quan trọng. Các thành phần thiết yếu của khung quản trị rủi ro?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       { content: 'Đào tạo toàn diện cho đội ngũ HR với các yêu cầu tuân thủ pháp lý', isCorrect: false },
  //       {
  //         content:
  //           'Đánh giá tác động, giám sát thiên kiến liên tục, quy trình giám sát của con người, thủ tục ứng phó sự cố, kiểm toán vệt toàn diện',
  //         isCorrect: true,
  //       },
  //       { content: 'Các quy trình tuyển dụng dự phòng và chiến lược đa dạng hóa nhà cung cấp', isCorrect: false },
  //       {
  //         content: 'Xem xét pháp lý của hợp đồng nhà cung cấp AI với các điều khoản trách nhiệm pháp lý',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Giám đốc Rủi ro cho tập đoàn tài chính phát triển khung rủi ro AI doanh nghiệp. Nhiều đơn vị kinh doanh sử dụng các ứng dụng AI đa dạng (giao dịch, chấm điểm tín dụng, phát hiện gian lận, dịch vụ khách hàng). Phương pháp tiếp cận?',
  //     level: SFIALevel.LEVEL_6_LEADERSHIP,
  //     competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 6)',
  //     estimatedTimeMinutes: 5,
  //     difficultyWeight: 6,
  //     answerOptions: [
  //       { content: 'Cấm sử dụng AI cho đến khi các hướng dẫn quy định toàn diện được thiết lập', isCorrect: false },
  //       {
  //         content:
  //           'Phát triển quản trị AI phân tầng rủi ro: xác định khẩu vị rủi ro theo đơn vị kinh doanh, thiết lập cấu trúc quản trị, tạo bảng điều khiển giám sát thời gian thực, quy trình leo thang và ứng phó sự cố',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Cho phép các đơn vị kinh doanh tự quản lý rủi ro AI với giám sát doanh nghiệp định kỳ',
  //         isCorrect: false,
  //       },
  //       { content: 'Tập trung độc quyền vào tuân thủ quy định với các quy định tài chính hiện hành', isCorrect: false },
  //     ],
  //   },
  //   // B1. GIAO TIẾP AI & PROMPT ENGINEERING
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content: 'ChatGPT hỗ trợ động não cho bài luận về biến đổi khí hậu. Lệnh hiệu quả nhất?',
  //   //   level: SFIALevel.LEVEL_2_FOUNDATION,
  //   //   competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 2)',
  //   //   estimatedTimeMinutes: 2,
  //   //   difficultyWeight: 2,
  //   //   answerOptions: [
  //   //     {
  //   //       content: 'Phân tích các tác động lớn của biến đổi khí hậu và khuyến nghị các giải pháp toàn diện',
  //   //       isCorrect: false,
  //   //     },
  //   //     {
  //   //       content:
  //   //         'Tạo ra 8 góc nhìn độc đáo về tác động biến đổi khí hậu trên các lĩnh vực khác nhau (kinh tế, công nghệ, xã hội, sức khỏe) bao gồm cả thách thức và cơ hội',
  //   //       isCorrect: true,
  //   //     },
  //   //     {
  //   //       content:
  //   //         'Tạo dàn ý chi tiết cho bài luận học thuật bao gồm nguyên nhân, tác động và chiến lược giảm thiểu biến đổi khí hậu',
  //   //       isCorrect: false,
  //   //     },
  //   //     {
  //   //       content: 'Liệt kê 10 vấn đề biến đổi khí hậu quan trọng nhất với giải thích chi tiết và bằng chứng hỗ trợ',
  //   //       isCorrect: false,
  //   //     },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.MULTIPLE_CHOICE,
  //     content: 'Các kỹ thuật cải thiện chất lượng tạo mã từ LLM? (Chọn các phương pháp hiệu quả)',
  //     level: SFIALevel.LEVEL_3_APPLICATION,
  //     competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
  //     estimatedTimeMinutes: 3,
  //     difficultyWeight: 3,
  //     answerOptions: [
  //       {
  //         content: 'Tạo lệnh chuỗi suy nghĩ: "Giải thích phương pháp từng bước trước khi triển khai"',
  //         isCorrect: true,
  //       },
  //       { content: 'Học ít mẫu (Few-shot learning): Cung cấp 2-3 ví dụ đầu vào-đầu ra', isCorrect: true },
  //       { content: 'Chỉ định vai trò: "Bạn là nhà phát triển Python cấp cao với 10 năm kinh nghiệm"', isCorrect: true },
  //       { content: 'Đặt temperature=0 để có tính nhất quán tối đa trong đầu ra', isCorrect: false },
  //       { content: 'Sử dụng dấu phân cách mã rõ ràng như ```python để định dạng', isCorrect: true },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Xây dựng chatbot dịch vụ khách hàng xử lý thông tin nhạy cảm một cách an toàn. Các biện pháp bảo mật thiết yếu?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       { content: 'Tin tưởng đầu vào người dùng vì dịch vụ khách hàng yêu cầu giao tiếp mở', isCorrect: false },
  //       {
  //         content:
  //           'Triển khai xác thực đầu vào, lệnh có cấu trúc với dấu phân cách, hạn chế dựa trên vai trò, lọc đầu ra',
  //         isCorrect: true,
  //       },
  //       { content: 'Sử dụng phản hồi chung để tránh hoàn toàn các lỗ hổng bảo mật', isCorrect: false },
  //       { content: 'Dựa độc quyền vào các tính năng an toàn tích hợp của mô hình AI', isCorrect: false },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Thiết kế hệ thống RAG (Retrieval-Augmented Generation - Tạo Sinh Tăng Cường Truy Xuất) cho kiến thức nội bộ công ty. Các thành phần thiết yếu để triển khai hiệu quả?',
  //     level: SFIALevel.LEVEL_5_INNOVATION,
  //     competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 5)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 5,
  //     answerOptions: [
  //       {
  //         content: 'Một mô hình ngôn ngữ lớn duy nhất được huấn luyện độc quyền trên dữ liệu công ty',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Cơ sở dữ liệu vector, mô hình nhúng, tìm kiếm tương tự, cơ chế xếp hạng lại, quy trình tạo phản hồi',
  //         isCorrect: true,
  //       },
  //       { content: 'Tìm kiếm từ khóa truyền thống kết hợp với tạo phản hồi AI', isCorrect: false },
  //       { content: 'Nhiều mô hình AI chuyên biệt cho các lĩnh vực kiến thức khác nhau', isCorrect: false },
  //     ],
  //   },
  //   // B2. NGHIÊN CỨU & TỔNG HỢP THÔNG TIN
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content:
  //   //     'ChatGPT cung cấp dữ liệu thống kê về "việc áp dụng AI trong các công ty Việt Nam" cho bài tập học thuật. Bước xác minh đầu tiên?',
  //   //   level: SFIALevel.LEVEL_2_FOUNDATION,
  //   //   competentcySkillName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 2)',
  //   //   estimatedTimeMinutes: 2,
  //   //   difficultyWeight: 2,
  //   //   answerOptions: [
  //   //     { content: 'Sử dụng dữ liệu ngay lập tức vì tỷ lệ chính xác của ChatGPT thường cao', isCorrect: false },
  //   //     {
  //   //       content: 'Tham chiếu chéo với các nguồn có thẩm quyền như báo cáo chính phủ và khảo sát ngành',
  //   //       isCorrect: true,
  //   //     },
  //   //     { content: 'Yêu cầu ChatGPT cung cấp trích dẫn cụ thể và tài liệu nguồn', isCorrect: false },
  //   //     { content: 'Kiểm tra thông tin so với thống kê áp dụng AI quốc tế', isCorrect: false },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Nghiên cứu "tác động AI đến thị trường việc làm Việt Nam" cho báo cáo chiến lược. Phương pháp tổng hợp thông tin đa nguồn?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       { content: 'Tập trung độc quyền vào phân tích do AI tạo ra để có tính toàn diện và tốc độ', isCorrect: false },
  //       {
  //         content:
  //           'Sử dụng AI cho nghiên cứu ban đầu và nhận dạng mẫu, xác thực chéo với phỏng vấn chuyên gia, thống kê chính thức, nghiên cứu tình huống thực tế',
  //         isCorrect: true,
  //       },
  //       { content: 'Chỉ dựa vào các nguồn truyền thống để đảm bảo độ tin cậy tối đa', isCorrect: false },
  //       {
  //         content: 'Tính trung bình tất cả các nguồn có sẵn mà không xem xét sự khác biệt về độ tin cậy nguồn',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  //   // B3. LÀM VIỆC NHÓM & HỢP TÁC AI-CON NGƯỜI
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content:
  //   //     'Bạn cùng lớp yêu cầu phản hồi về dự án AI của họ. Mã hoạt động nhưng sử dụng phương pháp không hiệu quả. Phản hồi mang tính xây dựng nhất?',
  //   //   level: SFIALevel.LEVEL_2_FOUNDATION,
  //   //   competentcySkillName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 2)',
  //   //   estimatedTimeMinutes: 2,
  //   //   difficultyWeight: 2,
  //   //   answerOptions: [
  //   //     {
  //   //       content: 'Khởi đầu tuyệt vời! Đây là các đề xuất tối ưu hóa có thể cải thiện hiệu suất: ...',
  //   //       isCorrect: true,
  //   //     },
  //   //     {
  //   //       content: 'Nền tảng tốt. Hãy xem xét các phương pháp thay thế này để có hiệu quả tốt hơn: [đề xuất cụ thể]',
  //   //       isCorrect: false,
  //   //     },
  //   //     { content: 'Trông ổn', isCorrect: false },
  //   //     { content: 'Chỉ ra các vấn đề mà không đưa ra đề xuất cải thiện cụ thể', isCorrect: false },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Bạn là Quản lý Dự án AI và cần trình bày kết quả dự án chatbot khách hàng cho Hội đồng Điều hành công ty. Dự án đã hoàn thành với các kết quả sau: Chỉ số kỹ thuật: Độ chính xác 87%, thời gian phản hồi 12ms. Tác động kinh doanh: Cải thiện hiệu quả 15%, tiết kiệm chi phí 200.000 USD. Trong buổi họp 15 phút với CEO và các Giám đốc, bạn sẽ cấu trúc bài trình bày như thế nào để tạo tác động mạnh nhất?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       {
  //         content: 'Bắt đầu với phân tích chi tiết các chỉ số kỹ thuật để chứng minh tính khoa học của dự án',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Mở đầu bằng tác động kinh doanh, sau đó hỗ trợ bằng bằng chứng kỹ thuật, và kết thúc với đề xuất các bước tiếp theo cụ thể',
  //         isCorrect: true,
  //       },
  //       { content: 'Chỉ tập trung vào các con số kinh doanh để tránh làm phức tạp cuộc họp', isCorrect: false },
  //       { content: 'Để Hội đồng Điều hành chủ động đặt câu hỏi về những gì họ quan tâm', isCorrect: false },
  //     ],
  //   },
  //   // B4. HIỂU BIẾT DỮ LIỆU & XÁC THỰC
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content: 'Dự án học máy (Machine Learning) yêu cầu bộ dữ liệu hiệu suất sinh viên. Nguồn phù hợp nhất?',
  //   //   level: SFIALevel.LEVEL_2_FOUNDATION,
  //   //   competentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 2)',
  //   //   estimatedTimeMinutes: 2,
  //   //   difficultyWeight: 2,
  //   //   answerOptions: [
  //   //     { content: 'Các bài đăng trên mạng xã hội về hiệu suất học tập và điểm số', isCorrect: false },
  //   //     { content: 'Bộ dữ liệu giáo dục công khai từ các cơ quan chính phủ hoặc tổ chức nghiên cứu', isCorrect: true },
  //   //     { content: 'Dữ liệu sinh viên riêng tư từ cơ sở dữ liệu nội bộ của trường đại học bạn', isCorrect: false },
  //   //     { content: 'Dữ liệu tổng hợp được tạo ra dựa trên các giả định giáo dục', isCorrect: false },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Mô hình phân loại đạt độ chính xác 95%, nhưng bộ dữ liệu chứa 95% mẫu từ một lớp. Đánh giá tình huống thực tế?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       { content: 'Hiệu suất mô hình xuất sắc với thành tích độ chính xác cao', isCorrect: false },
  //       {
  //         content: 'Có khả năng gây hiểu lầm do mất cân bằng lớp - cần phân tích độ chính xác, độ nhạy, điểm F1',
  //         isCorrect: true,
  //       },
  //       { content: 'Độ chính xác đủ để đánh giá hiệu suất, tiến hành triển khai', isCorrect: false },
  //       { content: 'Tập trung vào đạt 100% độ chính xác trước khi đánh giá thêm', isCorrect: false },
  //     ],
  //   },
  //   // B5. PHÂN TÁCH VẤN ĐỀ & XÁC ĐỊNH PHẠM VI AI
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Công ty khởi nghiệp thương mại điện tử muốn "cải thiện trải nghiệm khách hàng bằng AI." Phương pháp phân tách và định phạm vi?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       { content: 'Xây dựng hệ thống AGI toàn diện giải quyết tất cả các điểm tiếp xúc khách hàng', isCorrect: false },
  //       {
  //         content:
  //           'Phân tách thành các trường hợp sử dụng cụ thể: động cơ khuyến nghị, chatbot hỗ trợ, tối ưu hóa giá, phát hiện gian lận - ưu tiên theo tác động và tính khả thi',
  //         isCorrect: true,
  //       },
  //       { content: 'Tập trung độc quyền vào triển khai chatbot như điểm vào dễ tiếp cận nhất', isCorrect: false },
  //       { content: 'Thuê ngoài toàn bộ sáng kiến AI cho các nhà cung cấp chuyên biệt', isCorrect: false },
  //     ],
  //   },
  //   // B6. NĂNG LỰC BẢO MẬT & QUYỀN RIÊNG TƯ
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Công ty khởi nghiệp AI thu thập dữ liệu người dùng để huấn luyện mô hình. Các yêu cầu đạo đức và pháp lý thiết yếu?',
  //     level: SFIALevel.LEVEL_3_APPLICATION,
  //     competentcySkillName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 3)',
  //     estimatedTimeMinutes: 3,
  //     difficultyWeight: 3,
  //     answerOptions: [
  //       {
  //         content: 'Tính minh bạch thu thập dữ liệu được công bố trong thỏa thuận Điều khoản Dịch vụ',
  //         isCorrect: false,
  //       },
  //       {
  //         content:
  //           'Đồng ý có thông tin, tùy chọn từ chối tham gia, nguyên tắc tối thiểu hóa dữ liệu, quy trình lưu trữ an toàn',
  //         isCorrect: true,
  //       },
  //       { content: 'Chỉ yêu cầu mã hóa dữ liệu và cơ sở hạ tầng máy chủ an toàn', isCorrect: false },
  //       { content: 'Yêu cầu quyền riêng tư chỉ áp dụng cho thông tin cá nhân nhạy cảm', isCorrect: false },
  //     ],
  //   },
  //   // C1. THÀNH THẠO CÔNG CỤ AI CỐT LỜI
  //   // {
  //   //   type: QuestionType.SINGLE_CHOICE,
  //   //   content: 'Công cụ AI tốt nhất để bắt đầu cho sinh viên không có kinh nghiệm trước đó?',
  //   //   level: SFIALevel.LEVEL_1_AWARENESS,
  //   //   competentcySkillName: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 1)',
  //   //   estimatedTimeMinutes: 1,
  //   //   difficultyWeight: 1,
  //   //   answerOptions: [
  //   //     { content: 'ChatGPT phiên bản miễn phí với cơ bản AI đối thoại và ứng dụng đa mục đích', isCorrect: true },
  //   //     {
  //   //       content: 'Claude.ai phiên bản miễn phí cung cấp các phong cách và phương pháp tương tác AI khác nhau',
  //   //       isCorrect: false,
  //   //     },
  //   //     { content: 'Bing Chat cung cấp tích hợp thông tin thời gian thực với khả năng AI', isCorrect: false },
  //   //     { content: 'Google Gemini với tích hợp hệ sinh thái Google và các tính năng hợp tác', isCorrect: false },
  //   //   ],
  //   // },
  //   {
  //     type: QuestionType.MULTIPLE_CHOICE,
  //     content:
  //       'Trưởng nhóm đánh giá 5 công cụ AI cốt lõi cho đội 20 người đa chức năng (phát triển, thiết kế, nội dung, bán hàng). Tiêu chí lựa chọn quan trọng nhất? (Chọn các yếu tố chính)',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 4)',
  //     estimatedTimeMinutes: 3,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       { content: 'Dễ sử dụng trên các mức độ kỹ năng kỹ thuật khác nhau', isCorrect: true },
  //       { content: 'Khả năng tích hợp với các công cụ quy trình làm việc hiện có', isCorrect: true },
  //       { content: 'Hiệu quả chi phí và mô hình cấp phép linh hoạt', isCorrect: true },
  //       { content: 'Luôn chọn các công cụ mới nhất để duy trì vị thế dẫn đầu công nghệ', isCorrect: false },
  //       { content: 'Chất lượng hỗ trợ và tính sẵn có của tài nguyên cộng đồng', isCorrect: true },
  //       { content: 'Tiêu chuẩn tuân thủ bảo mật và quyền riêng tư dữ liệu', isCorrect: true },
  //     ],
  //   },
  //   // C2. ĐÁNH GIÁ & LỰA CHỌN CÔNG CỤ
  //   {
  //     type: QuestionType.MULTIPLE_CHOICE,
  //     content:
  //       'Sinh viên hạn chế ngân sách tìm kiếm các công cụ học tập AI có giá trị cao. Các lựa chọn dễ tiếp cận tốt nhất? (Chọn các lựa chọn thực tế)',
  //     level: SFIALevel.LEVEL_2_FOUNDATION,
  //     competentcySkillName: 'Đánh Giá & Lựa Chọn Công Cụ (Level 2)',
  //     estimatedTimeMinutes: 2,
  //     difficultyWeight: 2,
  //     answerOptions: [
  //       { content: 'ChatGPT phiên bản miễn phí cho tương tác AI chung và hỗ trợ học tập', isCorrect: true },
  //       { content: 'Google Colab cho thử nghiệm và thực hành học máy', isCorrect: true },
  //       { content: 'GitHub Copilot với giảm giá giáo dục sinh viên', isCorrect: true },
  //       { content: 'Các nền tảng AI doanh nghiệp với tính năng nâng cao', isCorrect: false },
  //       { content: 'Các mô hình Hugging Face cho thử nghiệm dự án NLP', isCorrect: true },
  //     ],
  //   },
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Đội đánh giá GitHub Copilot cho 20 nhà phát triển với giá $10/tháng/người. Các yếu tố ROI biện minh cho đầu tư?',
  //     level: SFIALevel.LEVEL_3_APPLICATION,
  //     competentcySkillName: 'Đánh Giá & Lựa Chọn Công Cụ (Level 3)',
  //     estimatedTimeMinutes: 3,
  //     difficultyWeight: 3,
  //     answerOptions: [
  //       { content: 'Số dòng mã được tạo ra mỗi ngày trên các thành viên đội', isCorrect: false },
  //       {
  //         content:
  //           'Cải thiện tốc độ phát triển, giảm thời gian gỡ lỗi, sự hài lòng của nhà phát triển, tăng tốc phân phối tính năng',
  //         isCorrect: true,
  //       },
  //       { content: 'Tiết kiệm chi phí so với việc thuê thêm nguồn lực phát triển', isCorrect: false },
  //       { content: 'Tăng cường ấn tượng khách hàng và phân biệt thị trường', isCorrect: false },
  //     ],
  //   },
  //   // C3. TÍCH HỢP & THIẾT KẾ QUY TRÌNH
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Ứng dụng thực hiện 10.000 cuộc gọi API hàng ngày đến OpenAI với chi phí leo thang. Chiến lược tối ưu hóa chi phí duy trì chất lượng?',
  //     level: SFIALevel.LEVEL_4_INTEGRATION,
  //     competentcySkillName: 'Tích Hợp & Thiết Kế Quy Trình (Level 4)',
  //     estimatedTimeMinutes: 4,
  //     difficultyWeight: 4,
  //     answerOptions: [
  //       { content: 'Giảm việc sử dụng API bất kể tác động đến chức năng ứng dụng', isCorrect: false },
  //       {
  //         content:
  //           'Triển khai bộ nhớ đệm thông minh, sử dụng các mô hình nhỏ hơn cho các tác vụ đơn giản, gom nhóm các yêu cầu khi có thể',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Chuyển độc quyền sang các giải pháp thay thế miễn phí bất kể tác động chất lượng',
  //         isCorrect: false,
  //       },
  //       { content: 'Chấp nhận chi phí như chi phí không thể tránh khỏi của tích hợp AI', isCorrect: false },
  //     ],
  //   },
  //   // C4. ĐỔI MỚI & PHÁT TRIỂN TÙY CHỈNH
  //   {
  //     type: QuestionType.SINGLE_CHOICE,
  //     content:
  //       'Sự phát triển nhanh chóng của công cụ AI - công nghệ tiên tiến hôm nay trở thành tiêu chuẩn ngày mai. Chiến lược AI doanh nghiệp cho công ty trên nhiều đơn vị kinh doanh. Phương pháp lợi thế cạnh tranh bền vững?',
  //     level: SFIALevel.LEVEL_6_LEADERSHIP,
  //     competentcySkillName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 6)',
  //     estimatedTimeMinutes: 5,
  //     difficultyWeight: 6,
  //     answerOptions: [
  //       { content: 'Luôn áp dụng các công cụ mới nhất để duy trì vị thế dẫn đầu công nghệ', isCorrect: false },
  //       {
  //         content:
  //           'Phát triển các nguyên tắc kiến trúc thích ứng không phụ thuộc vào công cụ: xây dựng khả năng có thể chuyển đổi, đầu tư vào kỹ năng thích ứng, phòng thí nghiệm đổi mới, đối tác hệ sinh thái, tập trung vào sự xuất sắc dữ liệu và quy trình hơn là phụ thuộc vào công cụ',
  //         isCorrect: true,
  //       },
  //       {
  //         content: 'Tiêu chuẩn hóa trên các công cụ đã được chứng minh và tránh rủi ro công nghệ thử nghiệm',
  //         isCorrect: false,
  //       },
  //       {
  //         content: 'Theo các quyết định của người dẫn đầu thị trường và phương pháp đồng thuận ngành',
  //         isCorrect: false,
  //       },
  //     ],
  //   },
  // ];

  const questionsData = [
    // PHẦN I: TƯ DUY VỀ AI (MINDSET) - 14 câu - 40 điểm

    // A. Khả năng thích ứng & Tư duy phát triển (4 câu)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi AI bắt đầu được áp dụng rộng rãi trong ngành của bạn, chiến lược phát triển sự nghiệp hiệu quả nhất là:',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Chuyển sang ngành khác để tránh cạnh tranh với AI',
          isCorrect: false,
        },
        {
          content: 'Chuyên sâu vào các kỹ năng mà AI khó thay thế như tư duy sáng tạo',
          isCorrect: false,
        },
        {
          content: 'Phát triển kỹ năng kết hợp: chuyên môn cốt lõi + khả năng cộng tác với AI',
          isCorrect: true,
        },
        {
          content: 'Tập trung hoàn toàn vào việc trở thành chuyên gia về AI',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Công ty bạn triển khai công cụ AI mới cho nhóm phát triển. Những hành động nào thể hiện tư duy phát triển? (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tự thử nghiệm với công cụ trong dự án cá nhân trước khi áp dụng chính thức',
          isCorrect: true,
        },
        {
          content: 'Đợi khóa đào tạo chính thức từ nhân sự để đảm bảo không mắc lỗi',
          isCorrect: false,
        },
        {
          content: 'Tạo nhóm thảo luận với đồng nghiệp để chia sẻ phương pháp hiệu quả',
          isCorrect: true,
        },
        {
          content: 'Ghi chép lại bài học kinh nghiệm và những sai lầm để cải thiện',
          isCorrect: true,
        },
        {
          content: 'Chỉ sử dụng những tính năng được khuyến nghị trong hướng dẫn',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn là trưởng nhóm của công ty khởi nghiệp. Một số thành viên kỳ cựu ngại sử dụng AI vì lo ngại "mất giá trị", trong khi các bạn trẻ nhiệt tình muốn áp dụng AI cho mọi việc. Cách cân bằng hiệu quả nhất?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Để mỗi cá nhân tự quyết định mức độ sử dụng AI phù hợp với họ',
          isCorrect: false,
        },
        {
          content: 'Tạo dự án thử nghiệm nhỏ để thành viên kỳ cựu và trẻ cùng khám phá, rút ra nhận định',
          isCorrect: true,
        },
        {
          content:
            'Bắt buộc thành viên kỳ cựu thích ứng để theo kịp thời đại, hạn chế các bạn trẻ để tránh phụ thuộc quá mức',
          isCorrect: false,
        },
        {
          content: 'Phân chia công việc: thành viên kỳ cựu xử lý chiến lược, các bạn trẻ triển khai AI',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Một năm sau khi học sử dụng công cụ trò chuyện AI, bạn nhận ra kỹ năng thiết kế câu lệnh của mình đã không còn hiệu quả với các mô hình AI mới. Phản ứng này cho thấy điều gì?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Bạn đã học sai phương pháp từ đầu và cần học lại hoàn toàn',
          isCorrect: false,
        },
        {
          content: 'AI phát triển nhanh đòi hỏi việc học tập và thích ứng liên tục',
          isCorrect: true,
        },
        {
          content: 'Nên gắn bó với công cụ cũ vì đã quen thuộc, thay đổi nhiều sẽ phản tác dụng',
          isCorrect: false,
        },
        {
          content: 'Đã đến lúc chuyển trọng tâm sang các kỹ năng không dùng AI để tránh phụ thuộc',
          isCorrect: false,
        },
      ],
    },

    // B. Tự học & Cải tiến liên tục (3 câu - 8 điểm)
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Để phát triển hiểu biết về AI hiệu quả cho sự nghiệp dài hạn, bạn nên ưu tiên những gì? (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Hiểu các khái niệm cơ bản thay vì chỉ học kỹ năng sử dụng công cụ cụ thể',
          isCorrect: true,
        },
        {
          content: 'Tập trung vào các công cụ thịnh hành được nhắc đến nhiều trên mạng xã hội',
          isCorrect: false,
        },
        {
          content: 'Thực hành trực tiếp với các dự án thực tế thay vì chỉ học lý thuyết',
          isCorrect: true,
        },
        {
          content: 'Xây dựng mạng lưới với những người thực hành AI để trao đổi hiểu biết',
          isCorrect: true,
        },
        {
          content: 'Đợi các tiêu chuẩn ngành ổn định rồi mới bắt đầu học nghiêm túc',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang học AI để áp dụng cho nghiên cứu luận văn. Sau 2 tuần, bạn thấy choáng ngợp vì có quá nhiều công cụ và khái niệm. Cách tiếp cận bền vững nhất?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tập trung vào một lĩnh vực cụ thể liên quan đến luận văn, từ từ mở rộng',
          isCorrect: true,
        },
        {
          content: 'Học mọi thứ có sẵn để có hiểu biết toàn diện',
          isCorrect: false,
        },
        {
          content: 'Tạm dừng và chờ đến khi có người hướng dẫn để tránh học sai hướng',
          isCorrect: false,
        },
        {
          content: 'Chuyển sang phương pháp truyền thống vì đường cong học AI quá dốc',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi công cụ AI bạn đang sử dụng cho thực tập bất ngờ ngừng hoạt động, phản ứng nào cho thấy tư duy cải tiến liên tục tốt nhất?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Gắn bó với quy trình cũ và chờ công cụ phục hồi để duy trì tính nhất quán',
          isCorrect: false,
        },
        {
          content: 'Nhanh chóng tìm hiểu các lựa chọn thay thế và điều chỉnh quy trình để giảm thiểu gián đoạn',
          isCorrect: true,
        },
        {
          content: 'Báo cáo lên quản lý để công ty xử lý việc chuyển đổi công cụ cho toàn nhóm',
          isCorrect: false,
        },
        {
          content: 'Coi đây là cơ hội để loại bỏ hoàn toàn sự phụ thuộc vào AI',
          isCorrect: false,
        },
      ],
    },

    // C. Tư duy phản biện & Đạo đức (4 câu - 12 điểm)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Trợ lý nghiên cứu AI cung cấp cho bạn dữ liệu thống kê với độ tin cậy 95%. Cách diễn giải chính xác nhất là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Dữ liệu này đáng tin cậy cho mọi bối cảnh vì có độ tin cậy cao',
          isCorrect: false,
        },
        {
          content: 'Dữ liệu có tính hợp lệ thống kê nhưng cần xác minh khả năng áp dụng cho trường hợp cụ thể',
          isCorrect: true,
        },
        {
          content: 'Chỉ sử dụng dữ liệu này như bằng chứng hỗ trợ, không làm luận điểm chính',
          isCorrect: false,
        },
        {
          content: 'Độ tin cậy 95% có nghĩa là có 5% khả năng dữ liệu này hoàn toàn sai',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Trong dự án nhóm, bạn phát hiện nội dung do AI tạo ra có những sai sót tinh vi về sự thật. Phản ứng đạo đức bao gồm: (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Kiểm tra sự thật và sửa chữa các sai sót trước khi nộp bài',
          isCorrect: true,
        },
        {
          content: 'Thông báo với các thành viên nhóm về hạn chế của nội dung do AI tạo ra',
          isCorrect: true,
        },
        {
          content: 'Giữ im lặng để tránh làm chậm tiến độ dự án',
          isCorrect: false,
        },
        {
          content: 'Ghi chép việc sử dụng AI và quy trình xác minh trong báo cáo dự án',
          isCorrect: true,
        },
        {
          content: 'Thay thế hoàn toàn bằng nội dung do con người tạo ra để đảm bảo độ chính xác',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn sử dụng AI để soạn thảo thư xin việc. AI tạo ra nội dung rất ấn tượng nhưng hơi phóng đại kỹ năng mà bạn chưa có. Cách tiếp cận đúng đắn nhất?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Sử dụng nguyên bản vì thư xin việc cần phải ấn tượng để cạnh tranh',
          isCorrect: false,
        },
        {
          content: 'Chỉnh sửa để phản ánh chính xác kỹ năng hiện tại nhưng duy trì giọng điệu tự tin',
          isCorrect: true,
        },
        {
          content: 'Viết lại hoàn toàn bằng tay để đảm bảo 100% tính xác thực',
          isCorrect: false,
        },
        {
          content: 'Thêm tuyên bố miễn trừ rằng nội dung được AI hỗ trợ để minh bạch',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi chatbot AI đưa ra lời khuyên về tài chính cá nhân cho sinh viên, vấn đề nào đòi hỏi phải xác minh với con người ngay lập tức?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Lời khuyên mang tính chung chung và không cụ thể cho tình huống của bạn',
          isCorrect: false,
        },
        {
          content: 'Khuyến nghị liên quan đến đầu tư rủi ro cao hoặc có ý nghĩa pháp lý',
          isCorrect: true,
        },
        {
          content: 'Thông tin không được cập nhật với điều kiện thị trường hiện tại',
          isCorrect: false,
        },
        {
          content: 'Phản hồi quá dài và phức tạp để hiểu nhanh',
          isCorrect: false,
        },
      ],
    },

    // D. Hiểu ranh giới con người - AI (2 câu - 5 điểm)
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Trong những tình huống nào AI nên được con người giám sát thay vì hoạt động tự động? (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Đưa ra quyết định ảnh hưởng đến triển vọng nghề nghiệp của mọi người (tuyển dụng, đánh giá)',
          isCorrect: true,
        },
        {
          content: 'Kiểm duyệt nội dung cho các chủ đề nhạy cảm (chính trị, sức khỏe)',
          isCorrect: true,
        },
        {
          content: 'Nhập dữ liệu cơ bản và định dạng tài liệu',
          isCorrect: false,
        },
        {
          content: 'Tư vấn tài chính cho các quyết định quan trọng trong cuộc sống',
          isCorrect: true,
        },
        {
          content: 'Dịch ngôn ngữ cho các cuộc trò chuyện thường ngày',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Sự cộng tác tối ưu giữa con người và AI trong quy trình tạo nội dung thường là:',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Con người tạo dàn ý, AI điền chi tiết, con người xem xét sản phẩm cuối',
          isCorrect: false,
        },
        {
          content: 'AI tạo nhiều lựa chọn, con người tuyển chọn và tùy chỉnh, cùng nhau hoàn thiện',
          isCorrect: true,
        },
        {
          content: 'AI xử lý ý tưởng sáng tạo, con người tập trung hoàn toàn vào thực hiện kỹ thuật',
          isCorrect: false,
        },
        {
          content: 'Tách biệt hoàn toàn: con người và AI làm việc độc lập rồi kết hợp kết quả',
          isCorrect: false,
        },
      ],
    },

    // E. Nhận thức rủi ro & Bảo mật (1 câu - 3 điểm)
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Khi sử dụng công cụ AI cho công việc học tập hoặc nghề nghiệp, những thực hành nào giảm thiểu rủi ro? (Chọn 4 đáp án)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tránh nhập dữ liệu độc quyền hoặc thông tin nhận dạng cá nhân',
          isCorrect: true,
        },
        {
          content: 'Thường xuyên xác minh kết quả AI với các nguồn có thẩm quyền',
          isCorrect: true,
        },
        {
          content: 'Chỉ sử dụng công cụ AI được trường học hoặc công ty chính thức phê duyệt',
          isCorrect: false,
        },
        {
          content: 'Duy trì kế hoạch dự phòng cho trường hợp công cụ AI không khả dụng',
          isCorrect: true,
        },
        {
          content: 'Ghi chép việc sử dụng AI để đảm bảo tính có thể tái tạo và trách nhiệm',
          isCorrect: true,
        },
        {
          content: 'Hạn chế sử dụng AI cho các nhiệm vụ không quan trọng để giảm thiểu thiệt hại tiềm ẩn',
          isCorrect: false,
        },
      ],
    },

    // PHẦN II: KỸ NĂNG SỬ DỤNG AI (SKILLSET) - 13 câu - 35 điểm

    // A. Giao tiếp với AI & Thiết kế câu lệnh (4 câu - 10 điểm)
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Câu lệnh nào sẽ tạo ra kết quả chất lượng tốt nhất cho email kinh doanh?',
      level: SFIALevel.LEVEL_1_AWARENESS,
      competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 1)',
      estimatedTimeMinutes: 1,
      difficultyWeight: 1,
      answerOptions: [
        {
          content: 'Viết email chuyên nghiệp về việc hoãn cuộc họp',
          isCorrect: false,
        },
        {
          content:
            'Soạn thảo email gửi khách hàng giải thích việc chậm trễ 2 ngày trong giao hàng dự án, giữ giọng điệu xin lỗi nhưng tự tin, đề xuất thời gian mới',
          isCorrect: true,
        },
        {
          content: 'Giúp tôi viết email kinh doanh nghe chuyên nghiệp và lịch sự',
          isCorrect: false,
        },
        {
          content: 'Tạo email trang trọng cho tình huống công việc về vấn đề thời gian',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi phản hồi của AI không đáp ứng kỳ vọng, chiến lược tối ưu hiệu quả nhất là:',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Hoàn thiện dần với các câu lệnh tinh chỉnh dựa trên những thiếu sót cụ thể trong kết quả trước đó',
          isCorrect: true,
        },
        {
          content: 'Chuyển sang công cụ AI khác để so sánh kết quả',
          isCorrect: false,
        },
        {
          content: 'Thêm nhiều từ khóa và ví dụ để làm câu lệnh chi tiết hơn',
          isCorrect: false,
        },
        {
          content: 'Chia nhỏ yêu cầu thành nhiều câu lệnh nhỏ hơn',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn cần AI hỗ trợ phân tích dữ liệu cho luận văn, nhưng kết quả ban đầu thiếu chiều sâu. Trình tự nào tối ưu hiệu quả của câu lệnh?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Yêu cầu phân tích chi tiết → hỏi các chỉ số cụ thể hơn → xác thực với kiến thức chuyên ngành',
          isCorrect: false,
        },
        {
          content: 'Làm rõ câu hỏi nghiên cứu → chỉ định khung phân tích → thử nghiệm với dữ liệu mẫu → mở rộng quy mô',
          isCorrect: true,
        },
        {
          content: 'Cung cấp dữ liệu thô → yêu cầu phân tích toàn diện → tự kiểm tra tất cả kết quả',
          isCorrect: false,
        },
        {
          content: 'Bắt đầu với thống kê mô tả đơn giản → từ từ tăng độ phức tạp → tham chiếu chéo với tài liệu',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Kỹ thuật thiết kế câu lệnh (Prompt Engineering) nâng cao cho các nhiệm vụ phức tạp bao gồm: (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Chuỗi suy nghĩ (Chain-of-thought): yêu cầu AI giải thích các bước lý luận',
          isCorrect: true,
        },
        {
          content: 'Nhập vai (Role-playing): để AI đóng vai chuyên gia cụ thể',
          isCorrect: true,
        },
        {
          content: 'Nhồi nhét từ khóa để đảm bảo AI nắm bắt tất cả thuật ngữ quan trọng',
          isCorrect: false,
        },
        {
          content: 'Học từ ít ví dụ (Few-shot learning): cung cấp mẫu về định dạng kết quả mong muốn',
          isCorrect: true,
        },
        {
          content: 'Sử dụng nhiều ngôn ngữ để mở rộng khả năng kiến thức của AI',
          isCorrect: false,
        },
      ],
    },

    // B. Nghiên cứu & Tổng hợp thông tin (3 câu - 8 điểm)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'AI cung cấp thông tin nghiên cứu về "tác động của mạng xã hội đến sức khỏe tâm thần". Cách xác minh tốt nhất là:',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Kiểm tra chéo với các bài viết phổ biến về cùng chủ đề',
          isCorrect: false,
        },
        {
          content: 'So sánh với các nghiên cứu được bình duyệt và kiểm tra phương pháp được sử dụng',
          isCorrect: true,
        },
        {
          content: 'Yêu cầu AI cung cấp nguồn và trích dẫn cho các tuyên bố',
          isCorrect: false,
        },
        {
          content: 'Kiểm tra thông tin với kinh nghiệm cá nhân và quan sát',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Để tiến hành nghiên cứu toàn diện với sự hỗ trợ của AI, quy trình hiệu quả bao gồm: (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Bắt đầu với tổng quan rộng để hiểu phạm vi và các khái niệm chính',
          isCorrect: true,
        },
        {
          content: 'Có hệ thống xác minh các tuyên bố gây tranh cãi với nhiều nguồn',
          isCorrect: true,
        },
        {
          content: 'Chủ yếu dựa vào tổng hợp của AI để tiết kiệm thời gian xác minh thủ công',
          isCorrect: false,
        },
        {
          content: 'Phát triển khung cá nhân để tổ chức và đánh giá thông tin',
          isCorrect: true,
        },
        {
          content: 'Tập trung vào các nguồn gần đây vì thông tin cũ có thể đã lỗi thời',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Cho việc tổng quan tài liệu luận văn, AI đề xuất 20 bài báo liên quan nhưng bạn chỉ có thời gian đọc 8 bài. Chiến lược lựa chọn tối ưu là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Chọn các bài báo từ tạp chí hàng đầu để đảm bảo chất lượng',
          isCorrect: false,
        },
        {
          content:
            'Lựa chọn kết hợp các công trình nền tảng, nghiên cứu gần đây, và bài báo cụ thể liên quan đến khoảng trống nghiên cứu',
          isCorrect: true,
        },
        {
          content: 'Ưu tiên các bài báo mà AI trích dẫn thường xuyên trong phản hồi',
          isCorrect: false,
        },
        {
          content: 'Lấy mẫu ngẫu nhiên để tránh thiên kiến xác nhận trong việc lựa chọn',
          isCorrect: false,
        },
      ],
    },

    // C. Làm việc nhóm & Hợp tác AI-Con người (2 câu - 5 điểm)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Trong dự án cộng tác sử dụng AI, cách giải quyết xung đột khi các thành viên nhóm có mức độ thoải mái khác nhau với AI:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Thiết lập hướng dẫn chung về việc sử dụng AI và tiêu chuẩn chất lượng',
          isCorrect: true,
        },
        {
          content: 'Để các thành viên có kinh nghiệm xử lý tất cả tương tác AI để duy trì tính nhất quán',
          isCorrect: false,
        },
        {
          content: 'Tránh AI cho các sản phẩm quan trọng để phù hợp với tất cả mức độ thoải mái',
          isCorrect: false,
        },
        {
          content: 'Tạo quy trình riêng biệt: có hỗ trợ AI và cách tiếp cận truyền thống',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Sự cộng tác hiệu quả giữa AI và con người trong môi trường nhóm đòi hỏi: (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Minh bạch về đóng góp của AI để duy trì trách nhiệm',
          isCorrect: true,
        },
        {
          content: 'Phân chia rõ ràng trách nhiệm giữa nhiệm vụ của con người và AI',
          isCorrect: true,
        },
        {
          content: 'Tiêu chuẩn hóa công cụ AI để đảm bảo tính nhất quán trong nhóm',
          isCorrect: false,
        },
        {
          content: 'Kiểm tra chất lượng thường xuyên để xác thực công việc do AI tạo ra',
          isCorrect: true,
        },
        {
          content: 'Giảm thiểu việc sử dụng AI để tránh các vấn đề phụ thuộc',
          isCorrect: false,
        },
      ],
    },

    // D. Hiểu biết dữ liệu & Xác thực (2 câu - 6 điểm)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Công cụ AI tuyên bố có "độ chính xác 92%" trong việc phân tích cảm xúc từ bình luận khách hàng. Để đánh giá con số này có đáng tin hay không, bạn cần biết:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Dữ liệu nào đã được dùng để kiểm tra và cách thức đo lường độ chính xác',
          isCorrect: true,
        },
        {
          content: 'Công cụ này có giao diện thân thiện và dễ sử dụng không',
          isCorrect: false,
        },
        {
          content: 'Có bao nhiều người đã sử dụng công cụ này trước đây',
          isCorrect: false,
        },
        {
          content: 'Công cụ này có giá bao nhiêu và có các gói nâng cấp nào',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn hỏi AI cùng một câu hỏi hai lần nhưng nhận được hai câu trả lời khác nhau. Cách xử lý thông minh nhất là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tin câu trả lời thứ hai vì AI đã "học thêm" từ câu hỏi đầu tiên',
          isCorrect: false,
        },
        {
          content: 'Tìm hiểu tại sao có sự khác biệt và kiểm tra thông tin từ nguồn khác',
          isCorrect: true,
        },
        {
          content: 'Kết hợp hai câu trả lời để có thông tin đầy đủ hơn',
          isCorrect: false,
        },
        {
          content: 'Hỏi một người bạn biết về AI để họ quyết định câu nào đúng',
          isCorrect: false,
        },
      ],
    },

    // E. Giải quyết vấn đề & Xác định phạm vi AI (1 câu - 4 điểm)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn thực tập tại startup và được giao nhiệm vụ: phân tích 500 đánh giá khách hàng (có cả tiếng Việt và tiếng Anh) để đưa ra gợi ý cải thiện sản phẩm. Với ngân sách eo hẹp, cách tiếp cận thông minh nhất là:',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content:
            'Dùng AI phân loại đánh giá tích cực/tiêu cực → Nhóm theo chủ đề → Tự phân tích để đưa ra khuyến nghị cụ thể',
          isCorrect: true,
        },
        {
          content: 'Thuê dịch vụ AI đắt tiền để làm tất cả từ A đến Z và đưa ra báo cáo hoàn chỉnh',
          isCorrect: false,
        },
        {
          content: 'Đọc từng đánh giá một cách thủ công rồi mới dùng AI hỗ trợ bước cuối',
          isCorrect: false,
        },
        {
          content: 'Chỉ phân tích đánh giá tiếng Anh để tránh rắc rối với việc dịch thuật',
          isCorrect: false,
        },
      ],
    },

    // F. Bảo mật & Quyền riêng tư (1 câu - 2 điểm)
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Khi học tập hoặc làm việc, cách sử dụng AI an toàn bao gồm: (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Ẩn danh hóa dữ liệu nhạy cảm trước khi nhập vào hệ thống AI',
          isCorrect: true,
        },
        {
          content: 'Sử dụng công cụ AI được công ty phê duyệt cho các nhiệm vụ liên quan đến công việc',
          isCorrect: true,
        },
        {
          content: 'Tránh hoàn toàn AI cho thông tin bảo mật',
          isCorrect: false,
        },
        {
          content: 'Thường xuyên xem xét chính sách quyền riêng tư và xử lý dữ liệu của công cụ AI',
          isCorrect: true,
        },
        {
          content: 'Chia sẻ tự do thông tin do AI tạo ra vì không chứa dữ liệu gốc',
          isCorrect: false,
        },
      ],
    },

    // PHẦN III: SỬ DỤNG CÔNG CỤ AI (TOOLSET) - 8 câu - 25 điểm

    // A. Thành thạo công cụ AI cốt lõi (2 câu - 5 điểm)
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Khi đánh giá công cụ AI cho việc sử dụng cá nhân hoặc học tập, các yếu tố ưu tiên nên bao gồm: (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Hiệu quả chi phí tương ứng với các trường hợp sử dụng cụ thể',
          isCorrect: true,
        },
        {
          content: 'Cộng đồng và chất lượng tài liệu hướng dẫn',
          isCorrect: true,
        },
        {
          content: 'Nhận diện thương hiệu và sự phổ biến trên thị trường',
          isCorrect: false,
        },
        {
          content: 'Khả năng tích hợp với quy trình làm việc hiện có',
          isCorrect: true,
        },
        {
          content: 'Số lượng tính năng có sẵn trong gói miễn phí',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Bạn đã thành thạo công cụ trò chuyện AI và muốn mở rộng bộ công cụ AI. Bước tiếp theo hợp lý là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Thành thạo các tính năng nâng cao của công cụ trò chuyện trước khi thử công cụ mới',
          isCorrect: false,
        },
        {
          content: 'Thử nghiệm với các công cụ chuyên biệt cho các lĩnh vực cụ thể (lập trình, thiết kế, nghiên cứu)',
          isCorrect: true,
        },
        {
          content: 'Học các nguyên tắc cơ bản về AI để hiểu cách thức hoạt động bên trong của công cụ',
          isCorrect: false,
        },
        {
          content: 'Đợi sự đồng thuận của ngành về công cụ tốt nhất trước khi đầu tư thời gian',
          isCorrect: false,
        },
      ],
    },

    // B. Đánh giá & Lựa chọn công cụ (2 câu - 6 điểm)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Một dự án cần tạo nội dung: bài viết blog, mạng xã hội, chiến dịch email. Bạn có ngân sách cố định mỗi tháng. Chiến lược lựa chọn công cụ:',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Đánh Giá & Lựa Chọn Công Cụ (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content:
            'Đánh giá gói miễn phí của nhiều công cụ, nâng cấp một công cụ có hiệu quả đầu tư cao nhất cho nhiều loại nội dung',
          isCorrect: true,
        },
        {
          content: 'Đầu tư toàn bộ ngân sách vào công cụ cao cấp có tính năng toàn diện',
          isCorrect: false,
        },
        {
          content: 'Sử dụng độc quyền các công cụ miễn phí và xử lý thủ công các hạn chế',
          isCorrect: false,
        },
        {
          content: 'Hợp tác với người có công cụ cao cấp để chia sẻ chi phí',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Dấu hiệu cảnh báo cần xem xét khi đánh giá công cụ AI cho việc sử dụng lâu dài:',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Đánh Giá & Lựa Chọn Công Cụ (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Tính linh động trong các công việc và tiềm năng bị khóa từ nhà cung cấp',
          isCorrect: true,
        },
        {
          content: 'Chiến lược định giá tích cực với ưu đãi giảm giá thường xuyên',
          isCorrect: false,
        },
        {
          content: 'Cập nhật tính năng nhanh chóng và thay đổi giao diện thường xuyên',
          isCorrect: false,
        },
        {
          content: 'Cơ sở người dùng lớn với cộng đồng trực tuyến hoạt động',
          isCorrect: false,
        },
      ],
    },

    // C. Tích hợp & Thiết kế quy trình (2 câu - 7 điểm)
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Các bước cần thiết để phát triển một ứng dụng web với sự hỗ trợ của AI: (Chọn 4 đáp án)',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Tích Hợp & Thiết Kế Quy Trình (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Phân tích yêu cầu: AI phân tích user stories + developer xác định technical specs',
          isCorrect: true,
        },
        {
          content: 'Thiết kế UI/UX: AI tạo wireframes + developer tối ưu trải nghiệm người dùng',
          isCorrect: true,
        },
        {
          content: 'Phát triển: AI sinh boilerplate code + developer implement business logic',
          isCorrect: true,
        },
        {
          content: 'Phát triển hoàn toàn tự động từ yêu cầu đến deployment production',
          isCorrect: false,
        },
        {
          content: 'Kiểm thử: AI tạo test cases + developer xác minh edge cases và integration',
          isCorrect: true,
        },
        {
          content: 'Bảo trì: AI giám sát performance logs + developer tối ưu system architecture',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi tích hợp AI vào thói quen học tập hoặc làm việc hiện có, cách tiếp cận bền vững là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tích Hợp & Thiết Kế Quy Trình (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Bắt đầu tích hợp và sử dụng với các nhiệm vụ ít rủi ro, đo lường tác động',
          isCorrect: true,
        },
        {
          content: 'Đại tu quy trình hoàn toàn để tối đa hóa tiềm năng AI ngay lập tức',
          isCorrect: false,
        },
        {
          content: 'Hệ thống song song: sao lưu truyền thống + quy trình AI thử nghiệm',
          isCorrect: false,
        },
        {
          content: 'Áp dụng có chọn lọc chỉ cho các nhiệm vụ mà AI rõ ràng vượt trội',
          isCorrect: false,
        },
      ],
    },

    // D. Đổi mới & Sáng tạo với AI (2 câu - 7 điểm)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Đồ án tốt nghiệp: Xây dựng ứng dụng di động quản lý học tập thông minh cho sinh viên. Bạn muốn tích hợp AI để tạo lợi thế cạnh tranh. Cách tiếp cận nào cân bằng tốt nhất giữa tính đổi mới và tính khả thi?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      competentcySkillName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 5)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 5,
      answerOptions: [
        {
          content:
            'Sử dụng AI để tư duy các tính năng và tạo nguyên mẫu nhanh, tự đánh giá độ phức tạp kỹ thuật và xác thực với người dùng thực tế',
          isCorrect: true,
        },
        {
          content: 'Tập trung hoàn toàn vào việc trình diễn các thuật toán học máy để thể hiện chiều sâu kỹ thuật',
          isCorrect: false,
        },
        {
          content: 'Giảm thiểu việc tích hợp AI để nhấn mạnh các kỹ năng lập trình cốt lõi',
          isCorrect: false,
        },
        {
          content:
            'Kết hợp nhiều dịch vụ AI (hệ thống gợi ý, chatbot xử lý ngôn ngữ tự nhiên, thị giác máy tính) để tạo giải pháp toàn diện',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi sử dụng mã nguồn hoặc thiết kế giao diện do AI tạo ra cho các bài tập lập trình và dự án, thực hành đúng đắn là:',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Sử dụng kết quả từ AI làm điểm khởi đầu, tự cải tiến và đảm bảo hiểu rõ từng dòng mã',
          isCorrect: true,
        },
        {
          content: 'Sao chép trực tiếp mã AI nhưng thêm ghi chú ghi nhận công cụ AI đã sử dụng',
          isCorrect: false,
        },
        {
          content: 'Kết hợp các đoạn mã từ nhiều nguồn AI khác nhau để tạo giải pháp "độc đáo"',
          isCorrect: false,
        },
        {
          content:
            'Chỉ tham khảo gợi ý của AI như nguồn cảm hứng, tự thực hiện từ đầu để duy trì tính chính trực học thuật',
          isCorrect: false,
        },
      ],
    },
  ];

  const AI = [
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi AI bắt đầu được sử dụng rộng rãi trong ngành nghề của bạn, đâu sẽ là cách phát triển sự nghiệp hiệu quả nhất?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Chuyển sang ngành khác để tránh cạnh tranh với AI',
          isCorrect: false,
        },
        {
          content: 'Chuyên sâu vào các kỹ năng mà AI khó thay thế như tư duy sáng tạo hoặc liên quan đến cảm xúc',
          isCorrect: false,
        },
        {
          content: 'Phát triển kỹ năng kết hợp: chuyên môn cốt lõi + khả năng cộng tác với AI',
          isCorrect: true,
        },
        {
          content: 'Tập trung hoàn toàn vào việc trở thành chuyên gia về AI',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Khi công ty bạn triển khai công cụ AI mới cho nhóm phát triển, hành động nào sau đây thể hiện bạn có tư duy học hỏi và sẵn sàng thích nghi?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tự thử nghiệm với công cụ trong dự án cá nhân trước khi áp dụng chính thức',
          isCorrect: true,
        },
        {
          content: 'Đợi khóa đào tạo chính thức từ nhân sự để đảm bảo không mắc lỗi',
          isCorrect: false,
        },
        {
          content: 'Tạo nhóm thảo luận với đồng nghiệp để chia sẻ phương pháp hiệu quả',
          isCorrect: true,
        },
        {
          content: 'Ghi chú lại những điều đã học được và rút kinh nghiệm từ những lần sai sót',
          isCorrect: true,
        },
        {
          content: 'Chỉ sử dụng những tính năng được khuyến nghị trong hướng dẫn',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Sau một năm học cách dùng AI để hỗ trợ công việc, bạn thấy rằng kỹ năng viết prompt (câu lệnh) của mình không còn hiệu quả với phiên bản AI mới. Phản ứng này cho thấy điều gì?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Bạn đã học sai phương pháp từ đầu và cần học lại hoàn toàn',
          isCorrect: false,
        },
        {
          content: 'AI phát triển nhanh đòi hỏi việc học tập và thích ứng liên tục',
          isCorrect: true,
        },
        {
          content: 'Nên gắn bó với công cụ cũ vì đã quen thuộc, thay đổi nhiều sẽ phản tác dụng',
          isCorrect: false,
        },
        {
          content: 'Đã đến lúc chuyển trọng tâm sang các kỹ năng không dùng AI để tránh phụ thuộc',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Để phát triển hiểu biết về AI hiệu quả cho sự nghiệp dài hạn, bạn nên ưu tiên những gì?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tự Học & Cải Tiến Liên Tục',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Hiểu các khái niệm cơ bản thay vì chỉ học kỹ năng sử dụng công cụ cụ thể',
          isCorrect: true,
        },
        {
          content: 'Tập trung vào các công cụ thịnh hành được nhắc đến nhiều trên mạng xã hội',
          isCorrect: false,
        },
        {
          content: 'Thực hành trực tiếp với các dự án thực tế thay vì chỉ học lý thuyết',
          isCorrect: true,
        },
        {
          content: 'Xây dựng mạng lưới với những người thực hành AI để trao đổi hiểu biết',
          isCorrect: true,
        },
        {
          content: 'Đợi các tiêu chuẩn ngành ổn định rồi mới bắt đầu học nghiêm túc',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi công cụ AI bạn đang sử dụng bất ngờ ngừng hoạt động, phản ứng nào cho thấy tư duy cải tiến liên tục tốt nhất?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Tự Học & Cải Tiến Liên Tục ',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Gắn bó với quy trình cũ và chờ công cụ phục hồi để duy trì tính nhất quán',
          isCorrect: false,
        },
        {
          content: 'Nhanh chóng tìm hiểu các lựa chọn thay thế và điều chỉnh quy trình để giảm thiểu gián đoạn',
          isCorrect: true,
        },
        {
          content: 'Báo cáo lên quản lý để công ty xử lý việc chuyển đổi công cụ cho toàn nhóm',
          isCorrect: false,
        },
        {
          content: 'Coi đây là cơ hội để loại bỏ hoàn toàn sự phụ thuộc vào AI',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Trợ lý nghiên cứu AI cung cấp cho bạn dữ liệu thống kê với độ tin cậy 95%. Cách diễn giải chính xác nhất là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tư Duy Phản Biện & Đạo Đức',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Dữ liệu này đáng tin cậy cho mọi bối cảnh vì có độ tin cậy cao',
          isCorrect: false,
        },
        {
          content: 'Dữ liệu có tính hợp lệ thống kê nhưng cần xác minh khả năng áp dụng cho trường hợp cụ thể',
          isCorrect: true,
        },
        {
          content: 'Chỉ sử dụng dữ liệu này như bằng chứng hỗ trợ, không làm luận điểm chính',
          isCorrect: false,
        },
        {
          content: 'Độ tin cậy 95% có nghĩa là có 5% khả năng dữ liệu này hoàn toàn sai',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Trong một dự án nhóm, bạn phát hiện nội dung do AI tạo ra có những sai sót tinh vi về mặt sự thật. Những phản ứng nào sau đây được xem là phù hợp về mặt đạo đức?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Tư Duy Phản Biện & Đạo Đức',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Kiểm tra sự thật và sửa chữa các sai sót trước khi nộp bài',
          isCorrect: true,
        },
        {
          content: 'Thông báo với các thành viên nhóm về hạn chế của nội dung do AI tạo ra',
          isCorrect: true,
        },
        {
          content: 'Giữ im lặng để tránh làm chậm tiến độ dự án',
          isCorrect: false,
        },
        {
          content: 'Ghi chép việc sử dụng AI và quy trình xác minh trong báo cáo dự án',
          isCorrect: true,
        },
        {
          content: 'Thay thế hoàn toàn bằng nội dung do con người tạo ra để đảm bảo độ chính xác',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi chatbot AI đưa ra lời khuyên về tài chính cá nhân cho sinh viên, vấn đề nào đòi hỏi phải xác minh với con người ngay lập tức?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Tư Duy Phản Biện & Đạo Đức',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Lời khuyên mang tính chung chung và không cụ thể cho tình huống của bạn',
          isCorrect: false,
        },
        {
          content: 'Khuyến nghị liên quan đến đầu tư rủi ro cao hoặc có ý nghĩa pháp lý',
          isCorrect: true,
        },
        {
          content: 'Thông tin không được cập nhật với điều kiện thị trường hiện tại',
          isCorrect: false,
        },
        {
          content: 'Phản hồi quá dài và phức tạp để hiểu nhanh',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Trong những tình huống nào AI nên được con người giám sát thay vì hoạt động tự động?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Hiểu Ranh Giới Con Người - AI',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Đưa ra quyết định ảnh hưởng đến triển vọng nghề nghiệp của mọi người (tuyển dụng, đánh giá)',
          isCorrect: true,
        },
        {
          content: 'Kiểm duyệt nội dung cho các chủ đề nhạy cảm (chính trị, sức khỏe)',
          isCorrect: true,
        },
        {
          content: 'Nhập dữ liệu cơ bản và định dạng tài liệu',
          isCorrect: false,
        },
        {
          content: 'Tư vấn tài chính cho các quyết định quan trọng trong cuộc sống',
          isCorrect: true,
        },
        {
          content: 'Dịch ngôn ngữ cho các cuộc trò chuyện thường ngày',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Khi sử dụng công cụ AI cho công việc học tập hoặc nghề nghiệp, những thực hành nào giảm thiểu rủi ro?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Nhận Thức Rủi Ro & Bảo Mật',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tránh nhập dữ liệu độc quyền hoặc thông tin nhận dạng cá nhân',
          isCorrect: true,
        },
        {
          content: 'Thường xuyên xác minh kết quả AI với các nguồn có thẩm quyền',
          isCorrect: true,
        },
        {
          content: 'Chỉ sử dụng công cụ AI được trường học hoặc công ty chính thức phê duyệt',
          isCorrect: false,
        },
        {
          content: 'Duy trì kế hoạch dự phòng cho trường hợp công cụ AI không khả dụng',
          isCorrect: true,
        },
        {
          content: 'Ghi chép việc sử dụng AI để đảm bảo tính có thể tái tạo và trách nhiệm',
          isCorrect: true,
        },
        {
          content: 'Hạn chế sử dụng AI cho các nhiệm vụ không quan trọng để giảm thiểu thiệt hại tiềm ẩn',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Câu lệnh nào sẽ tạo ra kết quả chất lượng tốt nhất cho email kinh doanh?',
      level: SFIALevel.LEVEL_1_AWARENESS,
      competentcySkillName: 'Giao tiếp với AI & Thiết kế câu lệnh',
      estimatedTimeMinutes: 1,
      difficultyWeight: 1,
      answerOptions: [
        {
          content: 'Viết email chuyên nghiệp về việc hoãn cuộc họp',
          isCorrect: false,
        },
        {
          content:
            'Soạn thảo email gửi khách hàng giải thích việc chậm trễ 2 ngày trong giao hàng dự án, giữ giọng điệu xin lỗi nhưng tự tin, đề xuất thời gian mới',
          isCorrect: true,
        },
        {
          content: 'Giúp tôi viết email kinh doanh nghe chuyên nghiệp và lịch sự',
          isCorrect: false,
        },
        {
          content: 'Tạo email trang trọng cho tình huống công việc về vấn đề thời gian',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn cần AI hỗ trợ phân tích dữ liệu cho luận văn, nhưng kết quả ban đầu thiếu chiều sâu. Trình tự nào tối ưu hiệu quả của câu lệnh?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Giao tiếp với AI & Thiết kế câu lệnh',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Yêu cầu AI phân tích chi tiết → hỏi các chỉ số cụ thể hơn → xác thực với kiến thức chuyên ngành',
          isCorrect: false,
        },
        {
          content:
            'Làm rõ câu hỏi nghiên cứu → chỉ định khung phân tích → thử nghiệm với dữ liệu mẫu → mở rộng quy mô phân tích',
          isCorrect: true,
        },
        {
          content: 'Cung cấp dữ liệu thô cho AI → yêu cầu phân tích toàn diện → tự kiểm tra tất cả kết quả',
          isCorrect: false,
        },
        {
          content:
            'Bắt đầu với thống kê phân tích đơn giản → từ từ tăng độ phức tạp → tham chiếu chéo với tài liệu nghiên cứu liên quan',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Kỹ thuật thiết kế câu lệnh (Prompt Engineering) nâng cao cho các nhiệm vụ phức tạp bao gồm:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Giao tiếp với AI & Thiết kế câu lệnh',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Chuỗi suy nghĩ (Chain-of-thought): yêu cầu AI giải thích các bước lý luận',
          isCorrect: true,
        },
        {
          content: 'Nhập vai (Role-playing): để AI đóng vai chuyên gia cụ thể',
          isCorrect: true,
        },
        {
          content: 'Nhồi nhét từ khóa để đảm bảo AI nắm bắt tất cả thuật ngữ quan trọng',
          isCorrect: false,
        },
        {
          content: 'Học từ ít ví dụ (Few-shot learning): cung cấp mẫu về định dạng kết quả mong muốn',
          isCorrect: true,
        },
        {
          content: 'Sử dụng nhiều ngôn ngữ để mở rộng khả năng kiến thức của AI',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Để tiến hành nghiên cứu toàn diện với sự hỗ trợ của AI, quy trình hiệu quả bao gồm:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Nghiên cứu & Tổng hợp thông tin',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Bắt đầu bằng việc tổng quan rộng để hiểu phạm vi và các khái niệm chính',
          isCorrect: true,
        },
        {
          content: 'Xây dựng  hệ thống xác minh các tuyên bố gây tranh cãi với nhiều nguồn',
          isCorrect: true,
        },
        {
          content: 'Chủ yếu dựa vào tổng hợp của AI để tiết kiệm thời gian xác minh thủ công',
          isCorrect: false,
        },
        {
          content: 'Phát triển khung cá nhân để tổ chức và đánh giá thông tin',
          isCorrect: true,
        },
        {
          content: 'Tập trung vào các nguồn gần đây vì thông tin cũ có thể đã lỗi thời',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Cho việc tổng quan tài liệu luận văn, AI đề xuất 20 bài báo liên quan nhưng bạn chỉ có thời gian đọc 8 bài. Chiến lược lựa chọn tối ưu là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Nghiên cứu & Tổng hợp thông tin',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Chọn các bài báo từ tạp chí hàng đầu để đảm bảo chất lượng',
          isCorrect: false,
        },
        {
          content:
            'Lựa chọn kết hợp các công trình nền tảng, nghiên cứu gần đây, và bài báo cụ thể liên quan đến khoảng trống nghiên cứu',
          isCorrect: true,
        },
        {
          content: 'Ưu tiên các bài báo mà AI trích dẫn thường xuyên trong phản hồi',
          isCorrect: false,
        },
        {
          content: 'Lấy mẫu ngẫu nhiên để tránh thiên kiến xác nhận trong việc lựa chọn',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Sự cộng tác hiệu quả giữa AI và con người trong môi trường nhóm đòi hỏi: (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Làm việc nhóm & Hợp tác AI-Con người',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Minh bạch về đóng góp của AI để duy trì trách nhiệm',
          isCorrect: true,
        },
        {
          content: 'Phân chia rõ ràng trách nhiệm giữa nhiệm vụ của con người và AI',
          isCorrect: true,
        },
        {
          content: 'Tiêu chuẩn hóa công cụ AI để đảm bảo tính nhất quán trong nhóm',
          isCorrect: false,
        },
        {
          content: 'Kiểm tra chất lượng thường xuyên để xác thực công việc do AI tạo ra',
          isCorrect: true,
        },
        {
          content: 'Giảm thiểu việc sử dụng AI để tránh các vấn đề phụ thuộc',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Công cụ AI tuyên bố có "độ chính xác 92%" trong việc phân tích cảm xúc từ bình luận khách hàng. Để đánh giá con số này có đáng tin hay không, bạn cần biết:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Hiểu biết dữ liệu & Xác thực',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Dữ liệu nào đã được dùng để kiểm tra và phương pháp đo lường độ chính xác',
          isCorrect: true,
        },
        {
          content: 'Giao diện của công cụ có thân thiện và dễ sử dụng hay không',
          isCorrect: false,
        },
        {
          content: 'Số lượng người đã sử dụng công cụ này trước đây',
          isCorrect: false,
        },
        {
          content: 'Giá của công cụ và các gói nâng cấp hiện có',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn hỏi AI cùng một câu hỏi hai lần nhưng nhận được hai câu trả lời khác nhau. Cách xử lý thông minh nhất là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Hiểu biết dữ liệu & Xác thực',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tin câu trả lời thứ hai vì AI đã "học thêm" từ câu hỏi đầu tiên',
          isCorrect: false,
        },
        {
          content: 'Tìm hiểu tại sao có sự khác biệt và kiểm tra thông tin từ nguồn khác',
          isCorrect: true,
        },
        {
          content: 'Kết hợp hai câu trả lời để có thông tin đầy đủ hơn',
          isCorrect: false,
        },
        {
          content: 'Hỏi một người bạn biết về AI để họ quyết định câu nào đúng',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang thực tập tại một startup và được giao nhiệm vụ phân tích 500 đánh giá khách hàng (bao gồm cả tiếng Việt và tiếng Anh) để đưa ra gợi ý cải thiện sản phẩm. Với ngân sách hạn chế, đâu là cách tiếp cận hợp lý nhất?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Giải quyết vấn đề & Xác định phạm vi AI',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content:
            'Sử dụng AI phân loại đánh giá tích cực/tiêu cực → Nhóm theo chủ đề → Tự phân tích để đưa ra khuyến nghị cụ thể',
          isCorrect: true,
        },
        {
          content: 'Thuê dịch vụ AI cao cấp để thực hiện toàn bộ quy trình và cung cấp báo cáo hoàn chỉnh',
          isCorrect: false,
        },
        {
          content: 'Đọc từng đánh giá một cách thủ công rồi mới dùng AI hỗ trợ bước cuối',
          isCorrect: false,
        },
        {
          content: 'Chỉ phân tích đánh giá tiếng Anh để tiết kiệm thời gian và tránh chi phí dịch thuật',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Khi học tập hoặc làm việc, cách sử dụng AI an toàn bao gồm: (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Bảo mật & Quyền riêng tư',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Ẩn danh hóa dữ liệu nhạy cảm trước khi nhập vào hệ thống AI',
          isCorrect: true,
        },
        {
          content: 'Sử dụng công cụ AI được công ty phê duyệt cho các nhiệm vụ liên quan đến công việc',
          isCorrect: true,
        },
        {
          content: 'Tránh hoàn toàn việc sử dụng AI nếu có liên quan đến thông tin bảo mật',
          isCorrect: false,
        },
        {
          content: 'Thường xuyên xem xét chính sách quyền riêng tư và xử lý dữ liệu của công cụ AI',
          isCorrect: true,
        },
        {
          content: 'Chia sẻ tự do thông tin do AI tạo ra vì không chứa dữ liệu gốc',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Khi đánh giá công cụ AI cho việc sử dụng cá nhân hoặc học tập, bạn nên ưu tiên những yếu tố nào? (Chọn 3 đáp án)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Thành thạo công cụ AI cốt lõi',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content:
            'Hiệu quả chi phí – công cụ có xứng đáng với lợi ích thực tế trong các tình huống sử dụng cụ thể không?',
          isCorrect: true,
        },
        {
          content: 'Cộng đồng và chất lượng tài liệu hướng dẫn',
          isCorrect: true,
        },
        {
          content: 'Nhận diện thương hiệu và sự phổ biến trên thị trường',
          isCorrect: false,
        },
        {
          content: 'Khả năng tích hợp mượt mà với các công cụ và quy trình bạn đang dùng.',
          isCorrect: true,
        },
        {
          content: 'Số lượng tính năng có sẵn trong gói miễn phí',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Một dự án cần sản xuất nội dung đa dạng (bài blog, bài mạng xã hội, email marketing), trong khi ngân sách hàng tháng có giới hạn. Đâu là chiến lược lựa chọn công cụ hợp lý nhất?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Đánh giá & Lựa chọn công cụ',
      estimatedTimeMinutes: 3,
      difficultyWeight: 4,
      answerOptions: [
        {
          content:
            'Đánh giá gói miễn phí của nhiều công cụ, nâng cấp một công cụ có hiệu quả đầu tư cao nhất cho nhiều loại nội dung',
          isCorrect: true,
        },
        {
          content: 'Đầu tư toàn bộ ngân sách vào công cụ cao cấp có tính năng toàn diện',
          isCorrect: false,
        },
        {
          content: 'Chỉ sử dụng độc quyền các công cụ miễn phí và xử lý thủ công các hạn chế',
          isCorrect: false,
        },
        {
          content: 'Tìm người đang sử dụng công cụ cao cấp và hợp tác để cùng chia sẻ chi phí.',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Các bước cần thiết để phát triển một ứng dụng web với sự hỗ trợ của AI: (Chọn 4 đáp án)',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Tích hợp & Thiết kế quy trình',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Phân tích yêu cầu: AI hỗ trợ phân tích user stories trong khi developer xác định yêu cầu kỹ thuật.',
          isCorrect: true,
        },
        {
          content: 'Thiết kế UI/UX: AI tạo wireframes còn developer tối ưu trải nghiệm người dùng',
          isCorrect: true,
        },
        {
          content: 'Phát triển: AI sinh boilerplate code, trong khi developer implement business logic',
          isCorrect: true,
        },
        {
          content: 'Phát triển hoàn toàn tự động từ yêu cầu đến deployment production',
          isCorrect: false,
        },
        {
          content: 'Kiểm thử: AI tạo test cases, còn developer xác minh edge cases và integration',
          isCorrect: true,
        },
        {
          content: 'Bảo trì: AI giám sát performance logs, trong khi developer tối ưu system architecture',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi tích hợp AI vào thói quen học tập hoặc làm việc hiện có, cách tiếp cận bền vững là:',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tích hợp & Thiết kế quy trình',
      estimatedTimeMinutes: 2,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Bắt đầu tích hợp và sử dụng với các nhiệm vụ ít rủi ro, đo lường tác động',
          isCorrect: true,
        },
        {
          content: 'Thay đổi toàn bộ quy trình hiện tại để khai thác tối đa khả năng của AI ngay từ đầu.',
          isCorrect: false,
        },
        {
          content: 'Hệ thống song song: sao lưu truyền thống + quy trình AI thử nghiệm',
          isCorrect: false,
        },
        {
          content: 'Áp dụng có chọn lọc chỉ cho các nhiệm vụ mà AI rõ ràng vượt trội',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang thực hiện đồ án tốt nghiệp với đề tài “Xây dựng ứng dụng di động quản lý học tập thông minh cho sinh viên”. Để tạo điểm nhấn đổi mới, bạn muốn tích hợp các yếu tố AI. Trong bối cảnh nguồn lực hạn chế và thời gian có giới hạn, lựa chọn nào sau đây thể hiện cách tiếp cận cân bằng tốt nhất giữa tính sáng tạo và tính khả thi?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      competentcySkillName: 'Đổi mới & Sáng tạo với AI',
      estimatedTimeMinutes: 5,
      difficultyWeight: 5,
      answerOptions: [
        {
          content:
            'Ứng dụng AI để hỗ trợ phát triển ý tưởng và tạo nguyên mẫu nhanh, đồng thời tự đánh giá mức độ phức tạp kỹ thuật và xác minh tính phù hợp với nhu cầu người dùng thực tế.',
          isCorrect: true,
        },
        {
          content:
            'Tập trung vào triển khai các thuật toán học máy chuyên sâu để làm nổi bật chiều sâu kỹ thuật của sản phẩm.',
          isCorrect: false,
        },
        {
          content:
            'Giới hạn việc sử dụng AI để làm nổi bật năng lực lập trình cốt lõi và đảm bảo sự ổn định của hệ thống.',
          isCorrect: false,
        },
        {
          content:
            'Tích hợp đồng thời nhiều công nghệ AI (gợi ý học tập, chatbot, xử lý hình ảnh) nhằm xây dựng giải pháp toàn diện và mang tính đột phá.',
          isCorrect: false,
        },
      ],
    },
  ];

  await prisma.question.createMany({
    data: questionsData.map((qData, index) => ({
      type: qData.type,
      content: qData.content,
      estimatedTimeMinutes: qData.estimatedTimeMinutes,
      difficultyWeight: qData.difficultyWeight,
      maxPossibleScore: qData.difficultyWeight,
      sequence: index + 1,
      levelId: levelsMap[qData.level].id,
      competencySkillId: competenciesSkillMap[qData.competentcySkillName].id,
    })),
  });

  const createdQuestions = await prisma.question.findMany({
    orderBy: { sequence: 'asc' },
  });

  await prisma.answerOption.createMany({
    data: questionsData.flatMap((qData, index) =>
      qData.answerOptions.map((optionData) => ({
        content: optionData.content,
        isCorrect: optionData.isCorrect,
        questionId: createdQuestions[index].id,
      }))
    ),
  });
}
