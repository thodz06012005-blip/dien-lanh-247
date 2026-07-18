export const POLICY_VERSION = 'DL247-SVC-1.0';
export const POLICY_EFFECTIVE_DATE = '01/08/2026';
export const POLICY_PUBLISHED_DATE = '18/07/2026';
export const POLICY_APPROVAL_STATUS = 'PENDING_OWNER_AND_LEGAL_APPROVAL' as const;

export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export type PolicyIconName =
  | 'calendar'
  | 'clock'
  | 'cookie'
  | 'credit-card'
  | 'file-check'
  | 'landmark'
  | 'lock'
  | 'message-square-warning'
  | 'shield-check';

export interface PolicyDocument {
  title: string;
  shortTitle: string;
  summary: string;
  icon: PolicyIconName;
  sections: PolicySection[];
}

const partsRule =
  'Linh kiện và vật tư thay thế chỉ được cung cấp như một phần của báo giá dịch vụ đã được khách hàng chấp thuận; Điện Lạnh 247 không bán lẻ độc lập qua website.';

export const policies: Record<string, PolicyDocument> = {
  terms: {
    title: 'Điều khoản sử dụng website',
    shortTitle: 'Điều khoản website',
    summary: 'Quy định việc truy cập website, sử dụng tài khoản, nội dung và các kênh hỗ trợ của Điện Lạnh 247.',
    icon: 'landmark',
    sections: [
      {
        heading: '1. Phạm vi và chấp thuận',
        paragraphs: [
          'Khi truy cập website hoặc gửi thông tin, người dùng xác nhận đã đọc các điều khoản đang có hiệu lực. Website phục vụ việc tìm hiểu, đặt lịch, nhận báo giá và theo dõi dịch vụ; không phải website bán lẻ hàng hóa.',
        ],
      },
      {
        heading: '2. Tài khoản và thông tin cung cấp',
        bullets: [
          'Cung cấp thông tin liên hệ chính xác và chỉ sử dụng tài khoản thuộc quyền kiểm soát của mình.',
          'Bảo mật thông tin đăng nhập và báo ngay khi nghi ngờ tài khoản bị sử dụng trái phép.',
          'Không can thiệp, quét, phá hoại hoặc sử dụng website cho mục đích trái pháp luật.',
        ],
      },
      {
        heading: '3. Nội dung và liên kết',
        paragraphs: [
          'Nội dung tư vấn, giá và thời gian trên website mang tính tham khảo cho đến khi được xác nhận trong yêu cầu hoặc báo giá cụ thể. Liên kết ngoài, nếu có, chỉ nhằm cung cấp thông tin bổ sung và không thay thế thỏa thuận dịch vụ.',
        ],
      },
      {
        heading: '4. Thay đổi và liên hệ',
        paragraphs: [
          'Điều khoản có thể được cập nhật theo quy định pháp luật hoặc thay đổi vận hành. Phiên bản và ngày hiệu lực được công bố trên từng trang chính sách.',
        ],
      },
    ],
  },
  booking: {
    title: 'Chính sách đặt lịch dịch vụ',
    shortTitle: 'Đặt lịch',
    summary: 'Cách tiếp nhận, xác minh và xác nhận yêu cầu khảo sát, sửa chữa, vệ sinh, lắp đặt hoặc bảo trì.',
    icon: 'calendar',
    sections: [
      {
        heading: '1. Yêu cầu đặt lịch',
        paragraphs: [
          'Biểu mẫu trực tuyến ghi nhận thời gian mong muốn, không tự động bảo đảm kỹ thuật viên sẽ đến đúng thời điểm đó. Lịch chỉ được xác nhận sau khi Điện Lạnh 247 phản hồi qua kênh liên hệ đã đăng ký.',
        ],
      },
      {
        heading: '2. Thông tin cần thiết',
        bullets: [
          'Thông tin người liên hệ, địa chỉ phục vụ và khung giờ mong muốn.',
          'Loại thiết bị, biểu hiện sự cố, điều kiện tiếp cận và hình ảnh nếu có.',
          'Thông tin an toàn đặc biệt như rò điện, mùi khét, vị trí trên cao hoặc khu vực hạn chế.',
        ],
      },
      {
        heading: '3. Xác nhận và điều phối',
        paragraphs: [
          'Thời gian phản hồi, khoảng đến dự kiến và kỹ thuật viên có thể thay đổi vì giao thông, thời tiết, an toàn hoặc công việc trước kéo dài. Mọi thay đổi quan trọng sẽ được thông báo theo thông tin hiện có.',
        ],
      },
      {
        heading: '4. Linh kiện và vật tư',
        paragraphs: [partsRule],
      },
    ],
  },
  cancellation: {
    title: 'Chính sách hủy và đổi lịch',
    shortTitle: 'Hủy/đổi lịch',
    summary: 'Điều kiện tự đổi lịch, hủy yêu cầu và các chi phí có thể phát sinh khi kỹ thuật viên đã di chuyển hoặc đã chuẩn bị vật tư.',
    icon: 'clock',
    sections: [
      {
        heading: '1. Đổi lịch',
        bullets: [
          'Khách hàng có thể đề nghị đổi lịch khi yêu cầu đang ở trạng thái cho phép trên Customer Hub.',
          'Nên thông báo sớm nhất có thể và chọn thời gian tương lai phù hợp với khả năng điều phối.',
          'Lịch mới chỉ có hiệu lực sau khi được hệ thống hoặc nhân viên xác nhận.',
        ],
      },
      {
        heading: '2. Hủy yêu cầu',
        paragraphs: [
          'Yêu cầu chưa xác nhận hoặc kỹ thuật viên chưa di chuyển có thể được hủy mà không có phí dịch vụ. Nếu đã khảo sát, đã di chuyển theo lịch hoặc đã đặt vật tư riêng theo chấp thuận, chi phí thực tế sẽ được thông báo và đối chiếu trước khi thu.',
        ],
      },
      {
        heading: '3. Trường hợp từ phía Điện Lạnh 247',
        paragraphs: [
          'Điện Lạnh 247 có thể đề nghị đổi lịch khi không bảo đảm an toàn, thiếu điều kiện tiếp cận, thời tiết bất lợi hoặc không có kỹ thuật viên phù hợp. Khách hàng được quyền chọn lịch khác hoặc hủy yêu cầu chưa thực hiện.',
        ],
      },
    ],
  },
  pricing: {
    title: 'Chính sách báo giá và chi phí',
    shortTitle: 'Báo giá/chi phí',
    summary: 'Phân biệt giá tham khảo, phí khảo sát, báo giá chính thức và chi phí phát sinh trong quá trình thực hiện dịch vụ.',
    icon: 'file-check',
    sections: [
      {
        heading: '1. Giá tham khảo',
        paragraphs: [
          'Mức giá trên website chỉ giúp ước lượng ban đầu. Chi phí phụ thuộc tình trạng thiết bị, vị trí, phạm vi công việc, vật tư, thuế và yêu cầu an toàn tại địa điểm.',
        ],
      },
      {
        heading: '2. Phí khảo sát',
        paragraphs: [
          'Phí khảo sát, nếu áp dụng, phải được thông báo trước khi xác nhận lịch. Báo giá sẽ ghi rõ phí được khấu trừ, giữ nguyên hay phát sinh riêng khi khách hàng không tiếp tục dịch vụ.',
        ],
      },
      {
        heading: '3. Báo giá chính thức và phiên bản',
        bullets: [
          'Báo giá có mã, phiên bản, thời hạn hiệu lực và từng hạng mục công việc.',
          'Mọi thay đổi phải tạo phiên bản mới hoặc xác nhận bổ sung có thể truy vết.',
          'Chỉ triển khai sau khi khách hàng chấp thuận; khách hàng có quyền từ chối nếu chưa đồng ý.',
        ],
      },
      {
        heading: '4. Linh kiện, vật tư và chi phí phát sinh',
        paragraphs: [partsRule, 'Không tự ý thay linh kiện hoặc phát sinh công việc ngoài phạm vi đã được chấp thuận.'],
      },
    ],
  },
  payment: {
    title: 'Chính sách thanh toán dịch vụ',
    shortTitle: 'Thanh toán',
    summary: 'Phương thức, thời điểm, chứng từ và nguyên tắc đối soát thanh toán cho công việc dịch vụ đã được chấp thuận.',
    icon: 'credit-card',
    sections: [
      {
        heading: '1. Phương thức thanh toán',
        bullets: [
          'Tiền mặt sau khảo sát hoặc nghiệm thu theo báo giá.',
          'Chuyển khoản vào thông tin được xác nhận trên báo giá, hợp đồng hoặc kênh chính thức.',
          'Phương thức điện tử khác chỉ khi hệ thống hiển thị là khả dụng và có xác nhận giao dịch.',
        ],
      },
      {
        heading: '2. Thời điểm thanh toán',
        paragraphs: [
          'Thời điểm đặt cọc, thanh toán từng phần hoặc thanh toán sau nghiệm thu được ghi trong báo giá hoặc hợp đồng. Không chuyển tiền vào tài khoản cá nhân chưa được Điện Lạnh 247 xác nhận.',
        ],
      },
      {
        heading: '3. Đối soát và hoàn khoản',
        paragraphs: [
          'Khách hàng nên lưu mã yêu cầu và chứng từ. Giao dịch thừa, trùng hoặc không thể thực hiện sẽ được xác minh trước khi hoàn qua phương thức phù hợp; thời gian phụ thuộc ngân hàng hoặc trung gian thanh toán.',
        ],
      },
    ],
  },
  warranty: {
    title: 'Chính sách bảo hành dịch vụ',
    shortTitle: 'Bảo hành',
    summary: 'Phạm vi, thời hạn, trường hợp loại trừ và quy trình tiếp nhận bảo hành cho hạng mục đã nghiệm thu.',
    icon: 'shield-check',
    sections: [
      {
        heading: '1. Phạm vi và thời hạn',
        paragraphs: [
          'Bảo hành áp dụng cho đúng hạng mục sửa chữa, lắp đặt hoặc linh kiện được ghi trên báo giá, biên bản nghiệm thu và hồ sơ bảo hành. Thời hạn cụ thể được xác nhận theo từng yêu cầu.',
        ],
      },
      {
        heading: '2. Điều kiện tiếp nhận',
        bullets: [
          'Cung cấp mã yêu cầu, số điện thoại hoặc chứng từ liên quan.',
          'Thiết bị chưa bị bên thứ ba can thiệp vào hạng mục đang yêu cầu bảo hành.',
          'Tạo điều kiện kiểm tra an toàn tại địa điểm phục vụ.',
        ],
      },
      {
        heading: '3. Trường hợp loại trừ',
        bullets: [
          'Hư hỏng mới, khác hạng mục hoặc do sử dụng sai hướng dẫn.',
          'Nguồn điện, thiên tai, côn trùng, cháy nổ, va đập hoặc điều kiện môi trường bất thường.',
          'Vật tư hao mòn tự nhiên ngoài phạm vi đã cam kết.',
        ],
      },
      {
        heading: '4. Cách yêu cầu bảo hành',
        paragraphs: [
          'Gửi yêu cầu qua Customer Hub, hotline hoặc kênh hỗ trợ, kèm hình ảnh nếu có. Kết quả kiểm tra, phương án xử lý và phần chi phí ngoài bảo hành phải được giải thích trước khi thực hiện.',
        ],
      },
    ],
  },
  complaints: {
    title: 'Chính sách tiếp nhận khiếu nại',
    shortTitle: 'Khiếu nại',
    summary: 'Kênh tiếp nhận, thông tin cần cung cấp, thời gian phản hồi và cách xử lý bất đồng liên quan đến dịch vụ.',
    icon: 'message-square-warning',
    sections: [
      {
        heading: '1. Kênh tiếp nhận',
        paragraphs: [
          'Khách hàng có thể gửi khiếu nại qua hotline, email hỗ trợ hoặc biểu mẫu liên hệ. Nên cung cấp mã yêu cầu, thời gian, nội dung, bằng chứng và kết quả mong muốn.',
        ],
      },
      {
        heading: '2. Xác nhận và xử lý',
        bullets: [
          'Xác nhận đã tiếp nhận trong tối đa 02 ngày làm việc.',
          'Thông báo người phụ trách và yêu cầu bổ sung thông tin nếu cần.',
          'Cập nhật tiến độ cho các vụ việc cần kiểm tra kỹ thuật hoặc đối soát thanh toán.',
        ],
      },
      {
        heading: '3. Nguyên tắc giải quyết',
        paragraphs: [
          'Hai bên ưu tiên đối thoại dựa trên hồ sơ yêu cầu, báo giá, lịch sử trạng thái và biên bản nghiệm thu. Quyền khiếu nại, phản ánh tới cơ quan có thẩm quyền của khách hàng không bị hạn chế bởi quy trình nội bộ này.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật và dữ liệu cá nhân',
    shortTitle: 'Bảo mật',
    summary: 'Loại dữ liệu được xử lý, mục đích, căn cứ, thời hạn lưu giữ, chia sẻ và quyền của khách hàng.',
    icon: 'lock',
    sections: [
      {
        heading: '1. Dữ liệu được thu thập',
        bullets: [
          'Họ tên, số điện thoại, email, địa chỉ và thông tin tài khoản.',
          'Thông tin thiết bị, sự cố, lịch hẹn, hình ảnh, báo giá, thanh toán và bảo hành.',
          'Nhật ký bảo mật, thiết bị đăng nhập, địa chỉ mạng đã được giảm thiểu hoặc băm khi phù hợp.',
        ],
      },
      {
        heading: '2. Mục đích xử lý',
        bullets: [
          'Tiếp nhận, xác minh, điều phối và thực hiện dịch vụ.',
          'Lập báo giá, đối soát thanh toán, nghiệm thu và bảo hành.',
          'Bảo vệ tài khoản, phòng chống gian lận và cải thiện chất lượng.',
        ],
      },
      {
        heading: '3. Chia sẻ và lưu giữ',
        paragraphs: [
          'Điện Lạnh 247 không bán dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ cho nhân sự, kỹ thuật viên, nhà cung cấp cần thiết hoặc cơ quan có thẩm quyền theo phạm vi hợp pháp; thời hạn lưu giữ được giới hạn theo mục đích, nghĩa vụ kế toán, bảo hành và giải quyết tranh chấp.',
        ],
      },
      {
        heading: '4. Quyền và yêu cầu của khách hàng',
        bullets: [
          'Yêu cầu truy cập, sửa, cập nhật hoặc giải thích cách sử dụng dữ liệu.',
          'Rút đồng ý cho hoạt động không bắt buộc và từ chối tiếp thị.',
          'Yêu cầu xóa hoặc hạn chế xử lý khi pháp luật và nghĩa vụ lưu giữ cho phép.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Chính sách cookie và lưu trữ cục bộ',
    shortTitle: 'Cookie',
    summary: 'Giải thích cookie cần thiết, tùy chọn đo lường, lựa chọn của người dùng và thời gian lưu trên trình duyệt.',
    icon: 'cookie',
    sections: [
      {
        heading: '1. Cookie cần thiết',
        paragraphs: [
          'Cookie phiên, bảo mật và lựa chọn giao diện cần thiết giúp đăng nhập, bảo vệ biểu mẫu, duy trì phiên và ghi nhớ cài đặt cơ bản. Việc chặn các cookie này có thể làm một số chức năng không hoạt động.',
        ],
      },
      {
        heading: '2. Đo lường và tùy chọn',
        paragraphs: [
          'Cookie hoặc công nghệ đo lường không thiết yếu chỉ được bật theo cấu hình và lựa chọn phù hợp. Website không được coi im lặng hoặc tiếp tục cuộn trang là sự đồng ý cho mục đích không bắt buộc.',
        ],
      },
      {
        heading: '3. Quản lý lựa chọn',
        bullets: [
          'Điều chỉnh lựa chọn trong phần cài đặt cookie khi chức năng này khả dụng.',
          'Xóa hoặc chặn cookie bằng cài đặt trình duyệt.',
          'Liên hệ bộ phận hỗ trợ để hỏi về nhà cung cấp và thời hạn lưu cụ thể.',
        ],
      },
    ],
  },
};

export const policyNavigation = Object.entries(policies).map(([slug, document]) => ({
  slug,
  label: document.shortTitle,
}));

export const serviceFaq = [
  {
    question: 'Gửi biểu mẫu có đồng nghĩa lịch đã được xác nhận không?',
    answer: 'Không. Biểu mẫu ghi nhận thời gian mong muốn. Lịch chỉ được xác nhận khi Điện Lạnh 247 phản hồi qua điện thoại, email, thông báo hoặc Customer Hub.',
  },
  {
    question: 'Giá trên website có phải giá cuối cùng không?',
    answer: 'Không. Đây là giá tham khảo. Báo giá chính thức được lập sau khi có đủ thông tin hoặc kiểm tra thực tế và cần khách hàng chấp thuận trước khi làm.',
  },
  {
    question: 'Có bán riêng linh kiện hoặc vật tư không?',
    answer: 'Không bán lẻ độc lập qua website. Linh kiện và vật tư chỉ được cung cấp theo báo giá của một yêu cầu dịch vụ, có nguồn gốc và thời hạn bảo hành được ghi nhận khi áp dụng.',
  },
  {
    question: 'Tôi có thể đổi lịch hoặc hủy yêu cầu bằng cách nào?',
    answer: 'Đăng nhập Customer Hub và mở yêu cầu để xem thao tác được phép, hoặc liên hệ hotline. Điều kiện phụ thuộc trạng thái, việc kỹ thuật viên đã di chuyển và vật tư đã chuẩn bị.',
  },
  {
    question: 'Làm sao theo dõi báo giá, nghiệm thu và bảo hành?',
    answer: 'Dùng mã yêu cầu để tra cứu hoặc đăng nhập Customer Hub. Hồ sơ hiển thị timeline, các phiên bản báo giá, kết quả nghiệm thu và thông tin bảo hành đã phát hành.',
  },
  {
    question: 'Điện Lạnh 247 sử dụng ảnh thiết bị tôi gửi như thế nào?',
    answer: 'Ảnh được dùng để tư vấn, điều phối, thực hiện và lưu hồ sơ dịch vụ. Quyền và cách xử lý dữ liệu được mô tả trong chính sách bảo mật.',
  },
];
