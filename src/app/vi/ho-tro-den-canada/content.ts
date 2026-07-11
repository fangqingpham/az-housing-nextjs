import type { StaticImageData } from 'next/image'
import heroArrival from './assets/hero-arrival.jpg'
import hero640 from './assets/hero-640.webp'
import hero960 from './assets/hero-960.webp'
import heroMobile640 from './assets/hero-mobile-640.webp'
import heroMobile960 from './assets/hero-mobile-960.webp'
import housingFit from './assets/housing-fit.jpg'
import remoteViewing from './assets/remote-viewing.jpg'
import airport from './assets/airport.jpg'
import school from './assets/school.jpg'
import pricing from './assets/pricing.jpg'
import otherServices from './assets/other-services.jpg'

export type BridgeService = {
  id: string
  title: string
  summary: string
  explanation: string
  audience: string
  benefits: string[]
  price: string
  image: StaticImageData
  imageAlt: string
  prompt: string
}

export const heroImage = heroArrival
export const heroSources = {
  fallback: hero640,
  srcSet: `${hero640.src} 640w, ${hero960.src} 960w`,
  mobileFallback: heroMobile640,
  mobileSrcSet: `${heroMobile640.src} 640w, ${heroMobile960.src} 960w`,
}

export const trustPoints = [
  'Uy tín đáng tin cậy',
  'Người Việt tại Canada',
  'Phản hồi nhanh chóng',
  'Tận tâm hỗ trợ',
]

export const services: BridgeService[] = [
  {
    id: 'housing-fit',
    title: 'Tìm chỗ ở phù hợp',
    summary: 'Gợi ý khu vực, loại nhà và ngân sách phù hợp trước khi bạn đến.',
    explanation: 'A-Z hỗ trợ bạn hiểu lựa chọn thuê nhà tại Canada, lọc khu vực phù hợp và chuẩn bị thông tin cần thiết để bắt đầu tìm chỗ ở.',
    audience: 'Du học sinh, gia đình có con đi học, người mới đến Canada.',
    benefits: ['Tiết kiệm thời gian tìm kiếm', 'Hiểu khu vực và ngân sách', 'Giảm rủi ro chọn nhầm chỗ ở'],
    price: 'Yêu cầu báo giá',
    image: housingFit,
    imageAlt: 'Căn hộ sáng sủa tại Canada',
    prompt: 'Xin chào! Bạn đang muốn tìm hiểu thêm về dịch vụ tìm chỗ ở phù hợp. Bạn dự kiến đến Canada ở thành phố nào?',
  },
  {
    id: 'remote-viewing',
    title: 'Xem nhà từ xa',
    summary: 'Hỗ trợ xem nhà qua video, hình ảnh và nhận xét thực tế.',
    explanation: 'Khi bạn chưa thể đến xem trực tiếp, A-Z có thể hỗ trợ kiểm tra nhà, khu vực xung quanh và gửi thông tin để bạn cân nhắc.',
    audience: 'Người đang ở Việt Nam hoặc ngoài Canada nhưng cần thuê trước.',
    benefits: ['Xem nhà rõ hơn từ xa', 'Có nhận xét thực tế', 'Hạn chế rủi ro đặt cọc vội'],
    price: 'Từ $99',
    image: remoteViewing,
    imageAlt: 'Chuyên viên xem nhà và ghi chú',
    prompt: 'Xin chào! Bạn đang muốn tìm hiểu thêm về dịch vụ xem nhà từ xa. Bạn muốn xem nhà ở khu vực nào tại Canada?',
  },
  {
    id: 'airport-pickup',
    title: 'Đón sân bay',
    summary: 'Hỗ trợ đón tại sân bay và đưa về nơi ở trong ngày đầu tiên.',
    explanation: 'A-Z giúp hành trình ngày đầu nhẹ nhàng hơn bằng cách hỗ trợ đón sân bay và đưa bạn về chỗ ở đã sắp xếp.',
    audience: 'Du học sinh, phụ huynh, gia đình hoặc người mới đến lần đầu.',
    benefits: ['Đỡ bỡ ngỡ khi vừa hạ cánh', 'Phù hợp khi có hành lý nhiều', 'Dễ bắt đầu ngày đầu tại Canada'],
    price: 'Từ $199',
    image: airport,
    imageAlt: 'Máy bay hạ cánh tại Canada',
    prompt: 'Xin chào! Bạn đang muốn tìm hiểu thêm về dịch vụ đón sân bay. Bạn dự kiến đến Canada vào ngày nào?',
  },
  {
    id: 'custodianship',
    title: 'Dịch vụ giám hộ cho học sinh dưới 18 tuổi',
    summary: 'Thông tin hỗ trợ cho học sinh quốc tế dưới 18 tuổi.',
    explanation: 'A-Z có thể giải thích yêu cầu giám hộ tại Canada và hướng dẫn bước tiếp theo cho phụ huynh có con dưới 18 tuổi học tại Canada.',
    audience: 'Phụ huynh có học sinh quốc tế dưới 18 tuổi.',
    benefits: ['Hiểu giấy tờ cần chuẩn bị', 'Có người hỗ trợ tại Canada', 'Phù hợp với yêu cầu của trường'],
    price: 'Từ $1,500 / năm',
    image: school,
    imageAlt: 'Học sinh quốc tế tại trường học',
    prompt: 'Xin chào! Bạn đang muốn tìm hiểu thêm về dịch vụ giám hộ cho học sinh dưới 18 tuổi. Học sinh năm nay bao nhiêu tuổi và sẽ học tại trường nào?',
  },
  {
    id: 'pricing-costs',
    title: 'Bảng giá & Chi phí',
    summary: 'Xem mức phí khởi điểm và các khoản cần chuẩn bị.',
    explanation: 'A-Z giúp bạn hiểu chi phí dịch vụ, các khoản thuê nhà thường gặp và thời điểm cần thanh toán để lên kế hoạch rõ ràng.',
    audience: 'Người muốn dự trù ngân sách trước khi quyết định.',
    benefits: ['Dễ so sánh lựa chọn', 'Biết chi phí khởi điểm', 'Chuẩn bị ngân sách thực tế hơn'],
    price: 'Từ $99',
    image: pricing,
    imageAlt: 'Bảng chi phí và kế hoạch tài chính',
    prompt: 'Xin chào! Bạn đang muốn tìm hiểu thêm về bảng giá và chi phí. Bạn quan tâm dịch vụ nào của A-Z?',
  },
  {
    id: 'other-services',
    title: 'Dịch vụ khác',
    summary: 'Hỏi A-Z về ngân hàng, điện thoại, thẻ đi lại và hỗ trợ ngày đầu.',
    explanation: 'Ngoài chỗ ở, A-Z có thể trao đổi thêm về các nhu cầu ổn định cuộc sống ban đầu như ngân hàng, số điện thoại, đi lại và định hướng.',
    audience: 'Người mới đến Canada cần hỗ trợ linh hoạt.',
    benefits: ['Một đầu mối để hỏi nhanh', 'Có hướng dẫn bằng tiếng Việt', 'Dễ chọn dịch vụ phù hợp'],
    price: 'Yêu cầu báo giá',
    image: otherServices,
    imageAlt: 'Gia đình bước vào ngôi nhà mới',
    prompt: 'Xin chào! Bạn đang muốn tìm hiểu thêm về các dịch vụ khác. Bạn cần A-Z hỗ trợ phần nào khi đến Canada?',
  },
]

export const clientServices = services.map(({ image, imageAlt, ...service }) => service)
