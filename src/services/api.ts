import { Report, DashboardStats, Employee, ModuleType } from '../types';
import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';

const REPORTS_COL = 'reports';
const EMPLOYEES_COL = 'employees';
const SETTINGS_COL = 'settings';

const LOGS_COL = 'logs';

export const api = {
  async logAction(action: string, module: ModuleType, user: string, details?: string): Promise<void> {
    try {
      const newDocRef = doc(collection(db, LOGS_COL));
      await setDoc(newDocRef, {
        action,
        module,
        user,
        timestamp: new Date().toISOString(),
        details
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, LOGS_COL);
    }
  },
  async getReports(): Promise<Report[]> {
    try {
      const q = query(collection(db, REPORTS_COL), orderBy('reportDate', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, REPORTS_COL);
      return [];
    }
  },

  async createReport(report: Report): Promise<Report> {
    try {
      const newDocRef = doc(collection(db, REPORTS_COL));
      const data = { 
        ...report, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(newDocRef, data);
      return { id: newDocRef.id, ...data } as Report;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, REPORTS_COL);
      throw error;
    }
  },

  async updateReport(id: string, report: Report): Promise<Report> {
    try {
      const docRef = doc(db, REPORTS_COL, id);
      const data = { 
        ...report, 
        updatedAt: new Date().toISOString() 
      };
      delete (data as any).id; // Don't save ID inside document
      await updateDoc(docRef, data);
      return { id, ...data } as Report;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${REPORTS_COL}/${id}`);
      throw error;
    }
  },

  async deleteReport(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, REPORTS_COL, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${REPORTS_COL}/${id}`);
    }
  },

  async getEmployees(): Promise<Employee[]> {
    try {
      const q = query(collection(db, EMPLOYEES_COL), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, EMPLOYEES_COL);
      return [];
    }
  },

  async createEmployee(employee: Employee): Promise<Employee> {
    try {
      const newDocRef = doc(collection(db, EMPLOYEES_COL));
      const data = { 
        ...employee, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(newDocRef, data);
      return { id: newDocRef.id, ...data } as Employee;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, EMPLOYEES_COL);
      throw error;
    }
  },

  async updateEmployee(id: string, employee: Employee): Promise<Employee> {
    try {
      const docRef = doc(db, EMPLOYEES_COL, id);
      const data = { 
        ...employee, 
        updatedAt: new Date().toISOString() 
      };
      delete (data as any).id;
      await updateDoc(docRef, data);
      return { id, ...data } as Employee;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${EMPLOYEES_COL}/${id}`);
      throw error;
    }
  },

  async deleteEmployee(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, EMPLOYEES_COL, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${EMPLOYEES_COL}/${id}`);
    }
  },

  async getStats(): Promise<DashboardStats> {
    try {
      const [reportsSnap, employeesSnap] = await Promise.all([
        getDocs(collection(db, REPORTS_COL)),
        getDocs(collection(db, EMPLOYEES_COL))
      ]);

      const reports = reportsSnap.docs.map(d => d.data() as Report);
      const employees = employeesSnap.docs.map(d => d.data() as Employee);
      const today = new Date().toISOString().split('T')[0];

      // Festival Stats
      const festivalReports = reports.filter(r => r.module === 'Lễ hội');
      const productsCompleted = festivalReports
        .filter(r => r.stage === 'Gia công sản phẩm' && r.status !== 'Đang gia công')
        .reduce((sum, r) => sum + (r.quantity || 0), 0);
      
      const festivalProgress = festivalReports.filter(r => r.stage !== 'Gia công sản phẩm');
      const avgProgress = festivalProgress.length > 0 
        ? festivalProgress.reduce((sum, r) => sum + (r.progress || 0), 0) / festivalProgress.length 
        : 0;

      // Landscape Stats
      const landscapeReports = reports.filter(r => r.module === 'Thi công cây hoa');
      const landscape = {
        totalTrees: landscapeReports.reduce((sum, r) => sum + (r.treeQuantity || 0), 0),
        totalManDays: landscapeReports.reduce((sum, r) => sum + (r.manDays || 0), 0),
        totalHours: landscapeReports.reduce((sum, r) => sum + (r.constructionHours || 0), 0),
        totalWorkers: landscapeReports.reduce((sum, r) => sum + (r.workerCount || 0), 0),
      };

      // Maintenance Stats
      const maintenanceReports = reports.filter(r => r.module === 'Bảo dưỡng');
      const maintenance = {
        totalReports: maintenanceReports.filter(r => r.reportDate === today).length,
        totalManDays: maintenanceReports.reduce((sum, r) => sum + (r.manDays || 0), 0),
        totalAreas: new Set(maintenanceReports.map(r => r.area)).size,
        totalQuantity: maintenanceReports.reduce((sum, r) => sum + (r.quantity || 0), 0),
        totalPhotos: maintenanceReports.reduce((sum, r) => sum + (r.photos?.length || 0), 0),
      };

      // HR Stats
      const hr = {
        totalPersonnel: employees.length,
        totalEmployees: employees.filter(e => e.employeeType === 'Nhân viên').length,
        totalDailyWorkers: employees.filter(e => e.employeeType === 'Công nhật').length,
        working: employees.filter(e => e.workStatus === 'Đang làm việc').length,
        onLeave: employees.filter(e => e.workStatus === 'Tạm nghỉ').length,
        resigned: employees.filter(e => e.workStatus === 'Nghỉ việc').length,
      };

      return {
        totalTasks: festivalReports.length,
        avgProgress: Math.round(avgProgress),
        productsCompleted,
        reportsToday: festivalReports.filter(r => r.reportDate === today).length,
        landscape,
        maintenance,
        hr
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'stats');
      throw error;
    }
  },

  async getSettings(): Promise<any> {
    try {
      const snapshot = await getDocs(collection(db, SETTINGS_COL));
      const result: any = {};
      snapshot.forEach(doc => {
        result[doc.id] = doc.data().value;
      });
      return result;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, SETTINGS_COL);
      return {};
    }
  },

  async updateSettings(key: string, value: string[]): Promise<void> {
    try {
      await setDoc(doc(db, SETTINGS_COL, key), { value });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/${key}`);
      throw error;
    }
  }
};
