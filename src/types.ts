export type WorkType = 'Cải tạo' | 'Festival';
export type ModuleType = 'Nhân sự' | 'Lễ hội' | 'Thi công cây hoa' | 'Bảo dưỡng';
export type EmployeeType = 'Nhân viên' | 'Công nhật';
export type GenderType = 'Nam' | 'Nữ' | 'Khác';
export type WorkStatusType = 'Đang làm việc' | 'Tạm nghỉ' | 'Nghỉ việc';
export type StaffLevelType = 'Trưởng phòng' | 'Giám sát' | 'Chuyên viên' | 'Kiến trúc sư' | 'Nhân viên kỹ thuật' | 'Nhân viên' | 'Công nhật';
export type TeamGroupType = 'Văn phòng' | 'Sản xuất' | 'Thi công' | 'Chăm sóc bảo dưỡng' | 'Chuyên môn';

export interface Employee {
  id?: string;
  employeeCode: string;
  citizenId: string;
  fullName: string;
  employeeType: EmployeeType;
  gender: GenderType;
  dateOfBirth: string;
  joinDate: string;
  workStatus: WorkStatusType;
  staffLevel?: string;
  teamGroup: TeamGroupType;
  address: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HRStats {
  totalPersonnel: number;
  totalEmployees: number;
  totalDailyWorkers: number;
  working: number;
  onLeave: number;
  resigned: number;
}

export interface DashboardStats {
  totalTasks: number;
  avgProgress: number;
  productsCompleted: number;
  reportsToday: number;
  landscape?: LandscapeStats;
  maintenance?: MaintenanceStats;
  hr?: HRStats;
}

export type FestivalType = 'Mùa Xuân' | 'Ẩm Thực và Bia' | 'Mùa Thu' | 'Mùa Đông';
export type AreaType = 'Mặt Trời' | 'Mặt Trăng' | 'Diệu Kỳ' | 'Nguồn Cội';
export type StageType = 'Khảo sát' | 'Lên ý tưởng thiết kế' | 'Gia công sản phẩm' | 'Thi công cây hoa' | 'Bàn giao';
export type ProductType = 'Cây xi măng' | 'Khung khối tròn' | 'Tượng chú tiểu' | 'Chậu' | 'Chuồng chim gỗ' | 'Chuồng chim sắt' | 'Mô hình sóc' | 'Mô hình chim';
export type ProductStatus = 'Đang gia công' | 'Hoàn thành' | 'Đã bàn giao';
export type WorkStatus = 'Đang thực hiện' | 'Chậm tiến độ' | 'Hoàn thành';

export type ShiftType = 'Sáng' | 'Chiều' | 'Cả ngày';
export type LandZoneType = 'Vùng đất 1' | 'Vùng đất 2' | 'Vùng đất 3' | 'Vùng đất 4';
export type TreeSourceType = 'Cây mua ngoài' | 'Sản xuất' | 'Hasfarm';
export type TreeClassificationType = 'Cây lớn' | 'Cây bụi' | 'Cây hoa thảm';

export type MaintenanceType = 'Tưới nước' | 'Cắt tỉa' | 'Bón phân' | 'Phun thuốc BVTV' | 'Nhổ cỏ' | 'Dọn vệ sinh cảnh quan' | 'Thay cây chết' | 'Kiểm tra hệ thống tưới' | 'Khác';
export type PlantCategoryType = 'Cây lớn' | 'Cây bụi' | 'Cây hoa thảm' | 'Thảm cỏ';
export type UnitType = 'Cây' | 'm²' | 'Bồn' | 'Khu vực' | 'Khác';
export type PlantStatusType = 'Tốt' | 'Cần theo dõi' | 'Cây yếu' | 'Cây chết' | 'Sâu bệnh';

export interface Report {
  id?: string;
  module: ModuleType;
  reportDate: string;
  reporter: string;
  workType?: WorkType;
  festival?: FestivalType;
  area: AreaType;
  stage?: StageType;
  productType?: ProductType;
  quantity?: number;
  status?: string; // Can be ProductStatus, WorkStatus or PlantStatusType
  progress?: number;
  notes?: string;
  photos: string[]; // Base64 or URLs
  beforePhotos?: string[]; // Landscape: Before images
  afterPhotos?: string[];  // Landscape: After images
  
  // Landscape fields
  constructionTeam?: string;
  shift?: ShiftType;
  location?: string;
  landZone?: LandZoneType;
  treeType?: string;
  treeSource?: TreeSourceType;
  treeClassification?: TreeClassificationType;
  treeQuantity?: number;
  constructionHours?: number;
  workerCount?: number;
  manDays?: number;

  // Maintenance fields
  maintenanceType?: MaintenanceType;
  customMaintenanceType?: string;
  plantCategory?: PlantCategoryType;
  unitType?: UnitType;
  customUnitType?: string;
  plantStatus?: PlantStatusType;

  createdAt?: string;
  updatedAt?: string;
}

export interface Log {
  id?: string;
  action: string;
  module: ModuleType;
  user: string;
  timestamp: string;
  details?: string;
}

export interface DashboardStats {
  totalTasks: number;
  avgProgress: number;
  productsCompleted: number;
  reportsToday: number;
  landscape?: LandscapeStats;
  maintenance?: MaintenanceStats;
}

export interface LandscapeStats {
  totalTrees: number;
  totalManDays: number;
  totalHours: number;
  totalWorkers: number;
}

export interface MaintenanceStats {
  totalReports: number;
  totalManDays: number;
  totalAreas: number;
  totalQuantity: number;
  totalPhotos: number;
}
