export type WorkType = 'Cải tạo' | 'Festival';
export type FestivalType = 'Mùa Xuân' | 'Ẩm Thực và Bia' | 'Mùa Thu' | 'Mùa Đông';
export type AreaType = 'Mặt Trời' | 'Mặt Trăng' | 'Diệu Kỳ' | 'Nguồn Cội';
export type StageType = 'Khảo sát' | 'Lên ý tưởng thiết kế' | 'Gia công sản phẩm' | 'Thi công cảnh quan' | 'Bàn giao';
export type ProductType = 'Cây xi măng' | 'Khung khối tròn' | 'Tượng chú tiểu' | 'Chậu' | 'Chuồng chim gỗ' | 'Chuồng chim sắt' | 'Mô hình sóc' | 'Mô hình chim';
export type ProductStatus = 'Đang gia công' | 'Hoàn thành' | 'Đã bàn giao';
export type WorkStatus = 'Đang thực hiện' | 'Chậm tiến độ' | 'Hoàn thành';

export interface Report {
  id?: number;
  reportDate: string;
  reporter: string;
  workType: WorkType;
  festival?: FestivalType;
  area: AreaType;
  stage: StageType;
  productType?: ProductType;
  quantity?: number;
  status?: string; // Can be ProductStatus or WorkStatus
  progress?: number;
  notes?: string;
  photos: string[]; // Base64 or URLs
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalTasks: number;
  avgProgress: number;
  productsCompleted: number;
  reportsToday: number;
}
