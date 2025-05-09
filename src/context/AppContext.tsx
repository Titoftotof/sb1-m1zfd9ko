import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Child, Contract, DailyRecord, Attendance } from '../types';
// import { sampleContracts, sampleDailyRecords } from '../data/sampleData'; // sampleContracts n'est plus utilisé
import { sampleDailyRecords } from '../data/sampleData'; 
import { supabase } from '../lib/supabaseClient'; 
import { Session } from '@supabase/supabase-js'; // Importer Session

interface AppContextType {
  children: Child[];
  loadingChildren: boolean; 
  contracts: Contract[];
  loadingContracts: boolean; 
  dailyRecords: DailyRecord[];
  attendanceRecords: Attendance[];
  loadingAttendance: boolean; 
  addChild: (child: Omit<Child, 'id'>) => Promise<void>; 
  updateChild: (id: string, updatedChild: Partial<Omit<Child, 'id'>>) => Promise<void>; 
  addContract: (contract: Omit<Contract, 'id'>) => Promise<void>; 
  updateContract: (id: string, updatedContract: Partial<Omit<Contract, 'id'>>) => Promise<void>; 
  deleteContract: (contractId: string) => Promise<void>;
  addDailyRecord: (record: DailyRecord) => void;
  addAttendance: (attendance: Attendance) => Promise<void>; 
  updateAttendance: (id: string, updatedAttendance: Partial<Omit<Attendance, 'id' | 'childId' | 'date'>>) => Promise<void>; 
  deleteAttendance: (id: string) => Promise<void>; 
  uploadPhoto: (file: File, session: Session | null) => Promise<string | null>; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children: providerChildren }) => {
  const [childrenData, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState<boolean>(true); 
  const [contractsData, setContracts] = useState<Contract[]>([]); 
  const [loadingContracts, setLoadingContracts] = useState<boolean>(true); 
  const [dailyRecordsData, setDailyRecords] = useState<DailyRecord[]>(sampleDailyRecords);
  const [attendanceRecordsData, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(true); 

  useEffect(() => {
    const fetchChildren = async () => {
      setLoadingChildren(true);
      const { data, error } = await supabase.from('children').select('*');
      if (error) {
        console.error('Error fetching children:', error);
      } else if (data) {
        const mappedData: Child[] = data.map((dbChild: any) => ({
          id: dbChild.id,
          firstName: dbChild.firstname, 
          lastName: dbChild.lastname,   
          birthDate: dbChild.birthdate,
          gender: dbChild.gender,
          photo: dbChild.photo,
          parentInfo: typeof dbChild.parentinfo === 'string' ? JSON.parse(dbChild.parentinfo) : dbChild.parentinfo,
          medicalInfo: typeof dbChild.medicalinfo === 'string' ? JSON.parse(dbChild.medicalinfo) : dbChild.medicalinfo,
          authorizedPickups: typeof dbChild.authorizedpickups === 'string' ? JSON.parse(dbChild.authorizedpickups) : dbChild.authorizedpickups,
        }));
        setChildren(mappedData);
      }
      setLoadingChildren(false);
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      setLoadingAttendance(true);
      const { data, error } = await supabase.from('attendance_records').select('*');
      if (error) {
        console.error('Error fetching attendance records:', error);
      } else if (data) {
        const mappedData: Attendance[] = data.map((dbAttendance: any) => ({
          id: dbAttendance.id,
          childId: dbAttendance.childid,
          date: dbAttendance.date,
          arrivalTime: dbAttendance.arrivaltime,
          departureTime: dbAttendance.departuretime,
          status: dbAttendance.status,
          notes: dbAttendance.notes,
        }));
        setAttendanceRecords(mappedData);
      }
      setLoadingAttendance(false);
    };
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoadingContracts(true);
      const { data, error } = await supabase.from('contracts').select('*');
      if (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]); 
      } else if (data) {
        const mappedData: Contract[] = data.map((dbContract: any) => ({
          id: dbContract.id,
          childId: dbContract.childid, 
          startDate: dbContract.startdate,
          endDate: dbContract.enddate,
          type: dbContract.type,
          hoursPerWeek: dbContract.hoursperweek,
          regularSchedule: dbContract.regular_schedule ? (typeof dbContract.regular_schedule === 'string' ? JSON.parse(dbContract.regular_schedule) : dbContract.regular_schedule) : [],
          hourlyRate: dbContract.hourlyrate,
          maintenanceAllowance: dbContract.maintenanceallowance,
          mealsProvided: dbContract.mealsprovided,
          mealAllowance: dbContract.mealallowance,
          documentsUrl: dbContract.documentsurl || [], 
          status: dbContract.status,
          notes: dbContract.notes,
          monthlySchedule: dbContract.monthly_schedule ? (typeof dbContract.monthly_schedule === 'string' ? JSON.parse(dbContract.monthly_schedule) : dbContract.monthly_schedule) : [], // Ajout de monthlySchedule
        }));
        setContracts(mappedData);
      }
      setLoadingContracts(false);
    };
    fetchContracts();
  }, []);

  const addChild = async (child: Omit<Child, 'id'>) => {
    const childDataForSupabase = {
      firstname: child.firstName, lastname: child.lastName, birthdate: child.birthDate,
      gender: child.gender, photo: child.photo, parentinfo: child.parentInfo,
      medicalinfo: child.medicalInfo, authorizedpickups: child.authorizedPickups,
    };
    const { data, error } = await supabase.from('children').insert([childDataForSupabase]).select().single();
    if (error) { console.error('Error adding child:', error); throw error; } 
    else if (data) {
      const newChild: Child = {
        id: data.id, firstName: data.firstname, lastName: data.lastname,
        birthDate: data.birthdate, gender: data.gender, photo: data.photo,
        parentInfo: typeof data.parentinfo === 'string' ? JSON.parse(data.parentinfo) : data.parentinfo,
        medicalInfo: typeof data.medicalinfo === 'string' ? JSON.parse(data.medicalinfo) : data.medicalinfo,
        authorizedPickups: typeof data.authorizedpickups === 'string' ? JSON.parse(data.authorizedpickups) : data.authorizedpickups,
      };
      setChildren((prev) => [...prev, newChild]);
    }
  };

  const updateChild = async (id: string, updatedChild: Partial<Omit<Child, 'id'>>) => {
    const updateData: { [key: string]: any } = {};
    if (updatedChild.firstName !== undefined) updateData.firstname = updatedChild.firstName;
    if (updatedChild.lastName !== undefined) updateData.lastname = updatedChild.lastName;
    // ... (autres champs pour updateChild) ...
    if (Object.keys(updateData).length === 0) return;
    const { data, error } = await supabase.from('children').update(updateData).eq('id', id).select().single();
    if (error) { console.error('Error updating child:', error); throw error; }
    else if (data) {
      const updatedDbChild = data;
      const updatedChildState: Child = {
        id: updatedDbChild.id, firstName: updatedDbChild.firstname, lastName: updatedDbChild.lastname,
        birthDate: updatedDbChild.birthdate, gender: updatedDbChild.gender, photo: updatedDbChild.photo,
        parentInfo: typeof updatedDbChild.parentinfo === 'string' ? JSON.parse(updatedDbChild.parentinfo) : updatedDbChild.parentinfo,
        medicalInfo: typeof updatedDbChild.medicalinfo === 'string' ? JSON.parse(updatedDbChild.medicalinfo) : updatedDbChild.medicalinfo,
        authorizedPickups: typeof updatedDbChild.authorizedpickups === 'string' ? JSON.parse(updatedDbChild.authorizedpickups) : updatedDbChild.authorizedpickups,
      };
      setChildren((prev) => prev.map((c) => (c.id === id ? updatedChildState : c)));
    }
  };

  const addContract = async (contract: Omit<Contract, 'id'>) => {
    const newId = crypto.randomUUID();
    const daysperweekValue = contract.regularSchedule && contract.regularSchedule.length > 0 
      ? Array.from(new Set(contract.regularSchedule.map(entry => entry.dayOfWeek))) 
      : [];

    const contractDataForSupabase = {
      id: newId, 
      childid: contract.childId, 
      startdate: contract.startDate, 
      enddate: contract.endDate, 
      type: contract.type,
      hoursperweek: contract.hoursPerWeek, 
      daysperweek: daysperweekValue, 
      regular_schedule: contract.regularSchedule && contract.regularSchedule.length > 0 ? JSON.stringify(contract.regularSchedule) : null, 
      hourlyrate: contract.hourlyRate, 
      maintenanceallowance: contract.maintenanceAllowance, 
      mealsprovided: contract.mealsProvided, 
      mealallowance: contract.mealAllowance,
      documentsurl: contract.documentsUrl,
      status: contract.status,
      notes: contract.notes,
      monthly_schedule: contract.monthlySchedule && contract.monthlySchedule.length > 0 ? JSON.stringify(contract.monthlySchedule) : null, // Ajout de monthly_schedule
    };

    const { data, error } = await supabase.from('contracts').insert([contractDataForSupabase]).select().single();
    if (error) { console.error('Error adding contract:', error); throw error; } 
    else if (data) {
      const newDbContract = data;
      const newContract: Contract = {
        id: newDbContract.id, childId: newDbContract.childid, startDate: newDbContract.startdate,
        endDate: newDbContract.enddate, type: newDbContract.type, hoursPerWeek: newDbContract.hoursperweek,
        regularSchedule: newDbContract.regular_schedule ? (typeof newDbContract.regular_schedule === 'string' ? JSON.parse(newDbContract.regular_schedule) : newDbContract.regular_schedule) : [],
        hourlyRate: newDbContract.hourlyrate, maintenanceAllowance: newDbContract.maintenanceallowance,
        mealsProvided: newDbContract.mealsprovided, mealAllowance: newDbContract.mealallowance,
        documentsUrl: newDbContract.documentsurl || [], status: newDbContract.status, notes: newDbContract.notes,
        monthlySchedule: newDbContract.monthly_schedule ? (typeof newDbContract.monthly_schedule === 'string' ? JSON.parse(newDbContract.monthly_schedule) : newDbContract.monthly_schedule) : [], // Ajout de monthlySchedule
      };
      setContracts((prev) => [...prev, newContract]);
    }
  };

  const updateContract = async (id: string, updatedContract: Partial<Omit<Contract, 'id'>>) => {
    const contractDataForSupabase: { [key: string]: any } = {};
    if (updatedContract.childId !== undefined) contractDataForSupabase.childid = updatedContract.childId; 
    if (updatedContract.startDate !== undefined) contractDataForSupabase.startdate = updatedContract.startDate; 
    if (updatedContract.endDate !== undefined) contractDataForSupabase.enddate = updatedContract.endDate; 
    if (updatedContract.type !== undefined) contractDataForSupabase.type = updatedContract.type;
    if (updatedContract.hoursPerWeek !== undefined) contractDataForSupabase.hoursperweek = updatedContract.hoursPerWeek; 
    
    if (updatedContract.regularSchedule !== undefined) {
      contractDataForSupabase.daysperweek = updatedContract.regularSchedule && updatedContract.regularSchedule.length > 0
        ? Array.from(new Set(updatedContract.regularSchedule.map(entry => entry.dayOfWeek)))
        : [];
      contractDataForSupabase.regular_schedule = updatedContract.regularSchedule && updatedContract.regularSchedule.length > 0 ? JSON.stringify(updatedContract.regularSchedule) : null;
    }

    if (updatedContract.hourlyRate !== undefined) contractDataForSupabase.hourlyrate = updatedContract.hourlyRate; 
    if (updatedContract.maintenanceAllowance !== undefined) contractDataForSupabase.maintenanceallowance = updatedContract.maintenanceAllowance; 
    if (updatedContract.mealsProvided !== undefined) contractDataForSupabase.mealsprovided = updatedContract.mealsProvided; 
    if (updatedContract.mealAllowance !== undefined) contractDataForSupabase.mealallowance = updatedContract.mealAllowance; 
    if (updatedContract.documentsUrl !== undefined) contractDataForSupabase.documentsurl = updatedContract.documentsUrl; 
    if (updatedContract.status !== undefined) contractDataForSupabase.status = updatedContract.status;
    if (updatedContract.notes !== undefined) contractDataForSupabase.notes = updatedContract.notes;
    if (updatedContract.monthlySchedule !== undefined) { // Ajout de la gestion de monthlySchedule
      contractDataForSupabase.monthly_schedule = updatedContract.monthlySchedule && updatedContract.monthlySchedule.length > 0 ? JSON.stringify(updatedContract.monthlySchedule) : null;
    }
    
    if (Object.keys(contractDataForSupabase).length === 0) return;

    const { data, error } = await supabase.from('contracts').update(contractDataForSupabase).eq('id', id).select().single();
    if (error) { console.error('Error updating contract:', error); throw error; } 
    else if (data) {
      const updatedDbContract = data;
      const newUpdatedContract: Contract = {
        id: updatedDbContract.id, childId: updatedDbContract.childid, startDate: updatedDbContract.startdate,
        endDate: updatedDbContract.enddate, type: updatedDbContract.type, hoursPerWeek: updatedDbContract.hoursperweek,
        regularSchedule: updatedDbContract.regular_schedule ? (typeof updatedDbContract.regular_schedule === 'string' ? JSON.parse(updatedDbContract.regular_schedule) : updatedDbContract.regular_schedule) : [],
        hourlyRate: updatedDbContract.hourlyrate, maintenanceAllowance: updatedDbContract.maintenanceallowance,
        mealsProvided: updatedDbContract.mealsprovided, mealAllowance: updatedDbContract.mealallowance,
        documentsUrl: updatedDbContract.documentsurl || [], status: updatedDbContract.status, notes: updatedDbContract.notes,
        monthlySchedule: updatedDbContract.monthly_schedule ? (typeof updatedDbContract.monthly_schedule === 'string' ? JSON.parse(updatedDbContract.monthly_schedule) : updatedDbContract.monthly_schedule) : [], // Ajout de monthlySchedule
      };
      setContracts((prev) => prev.map((c) => (c.id === id ? newUpdatedContract : c)));
    }
  };

  const addDailyRecord = (record: DailyRecord) => {
    setDailyRecords((prev) => [...prev, record]);
  };

  const deleteContract = async (contractId: string) => {
    const { error } = await supabase.from('contracts').delete().eq('id', contractId);
    if (error) { console.error('Error deleting contract:', error); throw error; } 
    else {
      setContracts((prevContracts) => prevContracts.filter(contract => contract.id !== contractId));
    }
  };

  const addAttendance = async (attendance: Attendance) => { 
    const formatTimeForSupabase = (timeInput: string | null | undefined): string => {
      let timePart = "00:00:00"; 
      if (timeInput && timeInput.trim() !== "") {
        const trimmedTimeInput = timeInput.trim();
        if (trimmedTimeInput.match(/^\d{2}:\d{2}$/)) { timePart = trimmedTimeInput + ":00"; } 
        else if (trimmedTimeInput.match(/^\d{2}:\d{2}:\d{2}$/)) { timePart = trimmedTimeInput; } 
        else { console.warn(`Format d'heure inattendu pour la colonne TIME: '${trimmedTimeInput}', utilisation de 00:00:00 par défaut.`); }
      }
      return timePart; 
    };
    const arrivalTimeToStore = formatTimeForSupabase(attendance.arrivalTime);
    const departureTimeToStore = formatTimeForSupabase(attendance.departureTime);
    const attendanceDataForSupabase = {
      id: attendance.id, childid: attendance.childId, date: attendance.date, 
      arrivaltime: arrivalTimeToStore, status: attendance.status,
      departuretime: departureTimeToStore, notes: attendance.notes,
    };
    const { data, error } = await supabase.from('attendance_records').insert([attendanceDataForSupabase]).select();
    if (error) { console.error('Error adding attendance:', error); throw error; } 
    else if (data && data.length > 0) {
      const newDbAttendance = data[0];
      const newAttendanceRecord: Attendance = {
        id: newDbAttendance.id, childId: newDbAttendance.childid, date: newDbAttendance.date,
        arrivalTime: newDbAttendance.arrivaltime, departureTime: newDbAttendance.departuretime, 
        status: newDbAttendance.status, notes: newDbAttendance.notes, 
      };
      setAttendanceRecords((prev) => [...prev, newAttendanceRecord]);
    }
  };

  const updateAttendance = async (id: string, updatedAttendance: Partial<Omit<Attendance, 'id' | 'childId' | 'date'>>) => {
    const formatTimeForSupabase = (timeInput: string | null | undefined): string => {
      let timePart = "00:00:00";
      if (timeInput && timeInput !== "") {
        if (timeInput.match(/^\d{2}:\d{2}$/)) { timePart = timeInput + ":00"; }
        else if (timeInput.match(/^\d{2}:\d{2}:\d{2}$/)) { timePart = timeInput; }
        else { console.warn(`Format d'heure inattendu pour la colonne TIME: ${timeInput}, utilisation de 00:00:00 par défaut.`); }
      }
      return timePart;
    };
    const updateData: { [key: string]: any } = {};
    if (updatedAttendance.hasOwnProperty('arrivalTime')) { updateData.arrivaltime = formatTimeForSupabase(updatedAttendance.arrivalTime); }
    if (updatedAttendance.hasOwnProperty('departureTime')) { updateData.departuretime = formatTimeForSupabase(updatedAttendance.departureTime); }
    if (updatedAttendance.status !== undefined) updateData.status = updatedAttendance.status;
    if (updatedAttendance.notes !== undefined) updateData.notes = updatedAttendance.notes;
    if (Object.keys(updateData).length === 0) return;
    const { data, error } = await supabase.from('attendance_records').update(updateData).eq('id', id).select().single();
    if (error) { console.error('Error updating attendance:', error); throw error; } 
    else if (data) {
      const updatedDbAttendance = data;
      const updatedAttendanceRecord: Attendance = {
        id: updatedDbAttendance.id, childId: updatedDbAttendance.childid, date: updatedDbAttendance.date,
        arrivalTime: updatedDbAttendance.arrivaltime, departureTime: updatedDbAttendance.departuretime,
        status: updatedDbAttendance.status, notes: updatedDbAttendance.notes,
      };
      setAttendanceRecords((prev) => prev.map((att) => (att.id === id ? updatedAttendanceRecord : att)));
    }
  };

  const deleteAttendance = async (id: string) => {
    const { error } = await supabase.from('attendance_records').delete().eq('id', id);
    if (error) { console.error('Error deleting attendance:', error); throw error; } 
    else { setAttendanceRecords((prev) => prev.filter((att) => att.id !== id)); }
  };

  const uploadPhoto = async (file: File, session: Session | null): Promise<string | null> => { 
    if (!file) return null;
    if (!session) { console.error("No active session provided to uploadPhoto function."); return null; } 
    // else { console.log("Session provided to uploadPhoto, user ID:", session.user.id); }
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`; 
    const filePath = `public/${fileName}`; 
    // console.log(`Uploading photo to: ${filePath}`);
    const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
    if (uploadError) { console.error('Error uploading photo:', uploadError); throw uploadError; }
    const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
    if (!data || !data.publicUrl) { console.error('Could not get public URL for uploaded photo'); throw new Error('Could not get public URL for uploaded photo'); }
    // console.log(`Photo uploaded successfully. Public URL: ${data.publicUrl}`);
    return data.publicUrl;
  };

  return (
    <AppContext.Provider
      value={{
        children: childrenData,
        contracts: contractsData,
        loadingContracts, 
        dailyRecords: dailyRecordsData,
        attendanceRecords: attendanceRecordsData,
        loadingChildren, 
        loadingAttendance, 
        addChild,
        updateChild,
        addContract,
        updateContract,
        deleteContract, 
        addDailyRecord,
        addAttendance,
        updateAttendance,
        deleteAttendance, 
        uploadPhoto, 
      }}
    >
      {providerChildren} 
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
