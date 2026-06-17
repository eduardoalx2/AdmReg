/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, Plus, Trash2, ChevronLeft, ChevronRight, 
  FileText, LogIn, LogOut, Save, PlusCircle, 
  Calendar as CalendarIcon, MapPin, Briefcase, User as UserIcon,
  CheckCircle2, XCircle, AlertCircle, Clock
} from 'lucide-react';
import extenso from 'extenso';
import { format, subMonths, lastDayOfMonth, isWeekend, subDays, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, 
  addDoc, updateDoc, deleteDoc, Timestamp, User, collectionGroup 
} from './firebase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Error Handling Types
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// Types
interface Expense {
  id: string;
  reportId: string;
  categoryId: string;
  receiptNumber: string;
  value: number;
  createdAt: any;
}

interface Report {
  id: string;
  uid: string;
  name: string;
  localSaida: string;
  localDestino: string;
  motivoViagem: string;
  role: string;
  noRecibo: string;
  nomePorExtenso: string;
  nomeIgreja: string;
  cnpjCod: string;
  cidadeUf: string;
  data: string;
  assinatura: 'valdir' | 'edu' | 'none';
  consolidated: boolean;
  createdAt: any;
  updatedAt: any;
}

const CATEGORIES = [
  { id: 'hospedagem', label: 'Hospedagem' },
  { id: 'alimentacao', label: 'Alimentação' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'pedagio', label: 'Pedágio' },
  { id: 'combustivel', label: 'Combustível' },
  { id: 'estacionamento', label: 'Estacionamento' },
];

// Helper to get last business day of previous month
const getLastBusinessDayOfPrevMonth = () => {
  let date = lastDayOfMonth(subMonths(new Date(), 1));
  while (isWeekend(date)) {
    date = subDays(date, 1);
  }
  return format(date, 'yyyy-MM-dd');
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<'list' | 'edit' | 'preview' | 'dashboard'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [pendingUnlockAction, setPendingUnlockAction] = useState<(() => void) | null>(null);

  const handleFirestoreError = (err: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: err instanceof Error ? err.message : String(err),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    setError(`Erro no banco de dados (${operationType}): ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    // We don't throw here to avoid crashing the whole app, but we log it as required
  };

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch Reports
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'reports'), 
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const r = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(r);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'reports');
    });
    return unsubscribe;
  }, [user]);

  // Fetch Expenses for selected report
  useEffect(() => {
    if (!user || !selectedReportId) {
      setExpenses([]);
      return;
    }
    const q = query(collection(db, `reports/${selectedReportId}/expenses`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const e = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(e);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `reports/${selectedReportId}/expenses`);
    });
    return unsubscribe;
  }, [user, selectedReportId]);

  // Fetch all expenses for dashboard
  useEffect(() => {
    if (!user) return;
    const q = query(collectionGroup(db, 'expenses'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const e = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setAllExpenses(e);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'collectionGroup/expenses');
    });
    return unsubscribe;
  }, [user]);

  const selectedReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  // Dynamic Page Title
  useEffect(() => {
    if (view === 'dashboard') {
      document.title = 'Dashboard - Sistema de Relatório';
    } else if (view === 'edit' && selectedReport) {
      document.title = `Editando: ${selectedReport.name}`;
    } else if (view === 'preview' && selectedReport) {
      document.title = `Impressão: ${selectedReport.name}`;
    } else {
      document.title = 'Sistema de Relatório de Viagem - IEQ';
    }
  }, [view, selectedReport]);

  const totalsByCategory = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat.id] = expenses
        .filter(e => e.categoryId === cat.id)
        .reduce((sum, e) => sum + e.value, 0);
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const totalGeral = useMemo(() => {
    return (Object.values(totalsByCategory) as number[]).reduce((sum, val) => sum + val, 0);
  }, [totalsByCategory]);

  const totalExtenso = useMemo(() => {
    if (totalGeral === 0) return '';
    try {
      return extenso(totalGeral.toFixed(2).replace('.', ','), { mode: 'currency', currency: { type: 'BRL' } });
    } catch (e) {
      return '';
    }
  }, [totalGeral]);

  // Calculate totals for all reports for the list view
  const reportTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    allExpenses.forEach(expense => {
      totals[expense.reportId] = (totals[expense.reportId] || 0) + expense.value;
    });
    return totals;
  }, [allExpenses]);

  // Sort reports by modification date (updatedAt) descending
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const getTimestamp = (report: Report) => {
        if (report.updatedAt) {
          return report.updatedAt.toDate ? report.updatedAt.toDate().getTime() : new Date(report.updatedAt).getTime();
        }
        if (report.createdAt) {
          return report.createdAt.toDate ? report.createdAt.toDate().getTime() : new Date(report.createdAt).getTime();
        }
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [reports]);

  // Dashboard Data
  const dashboardData = useMemo(() => {
    if (!reports.length || !allExpenses.length) return { monthly: [], categories: [] };

    const monthlyMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};

    allExpenses.forEach(expense => {
      const report = reports.find(r => r.id === expense.reportId);
      if (!report) return;

      // Monthly
      const date = new Date(report.data + 'T12:00:00');
      const monthKey = format(date, 'MMM/yy', { locale: ptBR });
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + expense.value;

      // Category
      const cat = CATEGORIES.find(c => c.id === expense.categoryId);
      const catLabel = cat ? cat.label : 'Outros';
      categoryMap[catLabel] = (categoryMap[catLabel] || 0) + expense.value;
    });

    const monthly = Object.entries(monthlyMap).map(([name, total]) => ({ name, total }));
    const categories = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    return { monthly, categories };
  }, [reports, allExpenses]);

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#ca8a04'];

  // Handlers
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Login error', e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('list');
  };

  const createNewReport = async () => {
    if (!user) return;
    setError(null);
    try {
      const newReport: Partial<Report> = {
        uid: user.uid,
        name: `Relatório ${format(new Date(), 'MM/yyyy')} - Região 655 - 01`,
        localSaida: 'LONDRINA',
        localDestino: 'LONDRINA, CAMBÉ, IBIPORÃ E REGIÃO METROPOLITANA',
        motivoViagem: 'REUNIÕES, CONVOCAÇÕES E VISITAS PASTORAIS',
        role: 'Pastor',
        noRecibo: '',
        nomePorExtenso: user.displayName || '',
        nomeIgreja: 'IEQ CENTRAL',
        cnpjCod: '62.955.505/0252-32',
        cidadeUf: 'LONDRINA/PR',
        data: getLastBusinessDayOfPrevMonth(),
        assinatura: 'none',
        consolidated: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, 'reports'), newReport);
      setSelectedReportId(docRef.id);
      setView('edit');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
    }
  };

  const updateReport = async (data: Partial<Report>) => {
    if (!selectedReportId || !selectedReport) return;
    
    // If report is consolidated, prevent updates unless it's the consolidation toggle itself
    if (selectedReport.consolidated && !('consolidated' in data)) {
      setError('Este relatório está consolidado e não pode ser editado sem senha.');
      return;
    }

    try {
      await updateDoc(doc(db, 'reports', selectedReportId), { ...data, updatedAt: Timestamp.now() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${selectedReportId}`);
    }
  };

  const handleConsolidate = async () => {
    if (!selectedReport) return;
    
    if (selectedReport.consolidated) {
      // Prompt for password to unlock
      setShowPasswordPrompt(true);
      setPendingUnlockAction(() => () => updateReport({ consolidated: false }));
    } else {
      // Consolidate directly
      await updateReport({ consolidated: true });
    }
  };

  const verifyPassword = () => {
    if (passwordInput === 'admin') {
      if (pendingUnlockAction) {
        pendingUnlockAction();
      }
      setShowPasswordPrompt(false);
      setPasswordInput('');
      setPendingUnlockAction(null);
    } else {
      setError('Senha incorreta.');
    }
  };

  const addExpense = async (categoryId: string) => {
    if (!selectedReportId || !user) return;
    try {
      await addDoc(collection(db, `reports/${selectedReportId}/expenses`), {
        reportId: selectedReportId,
        uid: user.uid,
        categoryId,
        receiptNumber: '',
        value: 0,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reports/${selectedReportId}/expenses`);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!selectedReportId) return;
    try {
      await deleteDoc(doc(db, `reports/${selectedReportId}/expenses`, expenseId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${selectedReportId}/expenses/${expenseId}`);
    }
  };

  const updateExpense = async (expenseId: string, data: Partial<Expense>) => {
    if (!selectedReportId) return;
    try {
      await updateDoc(doc(db, `reports/${selectedReportId}/expenses`, expenseId), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${selectedReportId}/expenses/${expenseId}`);
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      if (selectedReportId === reportId) {
        setSelectedReportId(null);
        setView('list');
      }
      setShowDeleteConfirm(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${reportId}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-stone-200 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-4xl shadow-lg">
            Q
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Gerador de Recibo IEQ</h1>
            <p className="text-stone-500 text-sm">Faça login para gerenciar seus relatórios de viagem.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-100 hover:border-blue-600 hover:bg-blue-50 text-stone-700 font-bold py-4 rounded-2xl transition-all shadow-sm"
          >
            <LogIn size={20} className="text-blue-600" />
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-[100] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle size={24} />
          <div className="flex-1">
            <p className="text-sm font-bold">Ocorreu um erro</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <XCircle size={20} />
          </button>
        </div>
      )}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Relatório Consolidado</h3>
              <p className="text-stone-500 text-sm">Digite a senha para desbloquear a edição.</p>
            </div>
            <div className="space-y-4">
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                className="w-full border-2 border-stone-100 focus:border-blue-600 p-3 rounded-xl outline-none transition-colors text-center font-bold"
                placeholder="Senha"
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPasswordInput('');
                    setPendingUnlockAction(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={verifyPassword}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Excluir Relatório?</h3>
              <p className="text-stone-500 text-sm">Esta ação não pode ser desfeita e todos os lançamentos serão perdidos.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => deleteReport(showDeleteConfirm)}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('list')}
              className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md hover:scale-105 transition-transform"
            >
              Q
            </button>
            <div className="hidden md:block">
              <h1 className="text-sm font-bold uppercase tracking-widest text-stone-400">Sistema de Relatório de Viagem</h1>
              <p className="text-xs font-medium text-stone-600">Igreja do Evangelho Quadrangular</p>
            </div>
            {view === 'list' && (
              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Briefcase size={16} /> Dashboard
                </button>
                <button 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {view !== 'list' && (
              <button 
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-bold uppercase tracking-wider transition-colors"
              >
                <ChevronLeft size={18} /> Voltar
              </button>
            )}
            <div className="h-8 w-px bg-stone-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-900">{user.displayName}</p>
                <p className="text-[10px] text-stone-500">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="text-stone-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'list' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-stone-900">Meus Relatórios</h2>
                <p className="text-stone-500">Gerencie e organize seus reembolsos quinzenais.</p>
              </div>
              <button 
                onClick={createNewReport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
              >
                <PlusCircle size={20} /> Novo Relatório
              </button>
            </div>

            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              {sortedReports.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                  <div className="w-16 h-16 bg-stone-100 rounded-full mx-auto flex items-center justify-center text-stone-300">
                    <FileText size={32} />
                  </div>
                  <p className="text-stone-400 font-medium">Nenhum relatório encontrado. Comece criando um novo!</p>
                </div>
              ) : (
                sortedReports.map(report => (
                  <div 
                    key={report.id}
                    className="group bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setView('edit');
                    }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(report.id);
                          }}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-stone-900 line-clamp-1">{report.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-stone-400">
                              <p className="uppercase tracking-widest font-bold">
                                {format(new Date(report.data + 'T12:00:00'), "MMMM yyyy", { locale: ptBR })}
                              </p>
                              <div className="flex items-center gap-1 font-medium text-stone-400">
                                <Clock size={12} />
                                <span>
                                  Alterado: {report.updatedAt?.toDate ? format(report.updatedAt.toDate(), "dd/MM/yy HH:mm") : (report.createdAt?.toDate ? format(report.createdAt.toDate(), "dd/MM/yy HH:mm") : '')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
                          <div className="flex items-center gap-2 text-stone-500">
                            <MapPin size={14} />
                            <span className="text-[10px] font-bold uppercase">{report.cidadeUf}</span>
                          </div>
                          <span className="text-base font-black text-blue-600 shrink-0">
                            R$ {(reportTotals[report.id] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-stone-900">Dashboard de Viagens</h2>
                <p className="text-stone-500">Visão geral de gastos e estatísticas dos seus relatórios.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-6 py-3 rounded-2xl font-bold transition-all"
                >
                  <ChevronLeft size={20} /> Voltar
                </button>
                <button 
                  onClick={() => setView('list')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all"
                >
                  Ver Relatórios
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gastos por Mês */}
              <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <CalendarIcon size={20} className="text-blue-600" />
                  Gastos por Mês
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} tickFormatter={(value) => `R$ ${value}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Total']}
                      />
                      <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gastos por Categoria */}
              <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Briefcase size={20} className="text-purple-600" />
                  Distribuição por Categoria
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dashboardData.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Gasto']}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-100 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Geral Gasto</p>
                <p className="text-3xl font-black">
                  R$ {dashboardData.monthly.reduce((sum, item) => sum + item.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Média por Relatório</p>
                <p className="text-3xl font-black">
                  R$ {reports.length ? (dashboardData.monthly.reduce((sum, item) => sum + item.total, 0) / reports.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Total de Relatórios</p>
                <p className="text-3xl font-black text-stone-900">{reports.length}</p>
              </div>
            </div>
          </div>
        )}

        {view === 'edit' && selectedReport && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Editor */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black tracking-tight">Dados do Relatório</h3>
                  <button 
                    onClick={handleConsolidate}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${selectedReport.consolidated ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}
                  >
                    {selectedReport.consolidated ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    {selectedReport.consolidated ? 'Consolidado' : 'Consolidar'}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Nome do Relatório</label>
                  <input 
                    type="text" 
                    value={selectedReport.name}
                    onChange={(e) => updateReport({ name: e.target.value })}
                    disabled={selectedReport.consolidated}
                    className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    placeholder="Ex: Relatório 03/2026 - Região 655"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Nome do Beneficiário</label>
                  <input 
                    type="text" 
                    value={selectedReport.nomePorExtenso}
                    onChange={(e) => updateReport({ nomePorExtenso: e.target.value })}
                    disabled={selectedReport.consolidated}
                    className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    placeholder="Nome completo de quem recebe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Nome do Beneficiário</label>
                  <input 
                    type="text" 
                    value={selectedReport.nomePorExtenso}
                    onChange={(e) => updateReport({ nomePorExtenso: e.target.value })}
                    disabled={selectedReport.consolidated}
                    className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    placeholder="Nome completo de quem recebe"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Igreja</label>
                    <select 
                      value={selectedReport.nomeIgreja}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updates: Partial<Report> = { nomeIgreja: val };
                        if (val === 'IEQ CENTRAL') updates.cnpjCod = '62.955.505/0252-32';
                        else if (val === 'Região 655') updates.cnpjCod = '655';
                        updateReport(updates);
                      }}
                      disabled={selectedReport.consolidated}
                      className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    >
                      <option value="IEQ CENTRAL">IEQ CENTRAL</option>
                      <option value="Região 655">Região 655</option>
                      <option value="Outra igreja">Outra igreja</option>
                    </select>
                    {selectedReport.nomeIgreja === 'Outra igreja' && (
                      <input 
                        type="text" 
                        placeholder="Nome da Igreja"
                        onChange={(e) => updateReport({ nomeIgreja: e.target.value })}
                        disabled={selectedReport.consolidated}
                        className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors mt-2"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Cód. ou CNPJ</label>
                    <select 
                      value={selectedReport.cnpjCod}
                      onChange={(e) => updateReport({ cnpjCod: e.target.value })}
                      disabled={selectedReport.consolidated}
                      className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    >
                      <option value="62.955.505/0252-32">62.955.505/0252-32</option>
                      <option value="655">655</option>
                      <option value="outro">outro</option>
                    </select>
                    {(selectedReport.cnpjCod === 'outro' || (!['62.955.505/0252-32', '655'].includes(selectedReport.cnpjCod) && selectedReport.nomeIgreja === 'Outra igreja')) && (
                      <input 
                        type="text" 
                        placeholder="CNPJ ou Código"
                        value={selectedReport.cnpjCod === 'outro' ? '' : selectedReport.cnpjCod}
                        onChange={(e) => updateReport({ cnpjCod: e.target.value })}
                        disabled={selectedReport.consolidated}
                        className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Local de Saída</label>
                    <select 
                      value={['LONDRINA'].includes(selectedReport.localSaida) ? selectedReport.localSaida : 'outro'}
                      onChange={(e) => {
                        if (e.target.value !== 'outro') updateReport({ localSaida: e.target.value });
                      }}
                      disabled={selectedReport.consolidated}
                      className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    >
                      <option value="LONDRINA">LONDRINA</option>
                      <option value="outro">Outro (manual)</option>
                    </select>
                    {(!['LONDRINA'].includes(selectedReport.localSaida) || selectedReport.localSaida === 'outro') && (
                      <input 
                        type="text" 
                        value={selectedReport.localSaida === 'outro' ? '' : selectedReport.localSaida}
                        onChange={(e) => updateReport({ localSaida: e.target.value })}
                        disabled={selectedReport.consolidated}
                        className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors mt-2"
                        placeholder="Local de Saída Manual"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Local de Destino</label>
                    <select 
                      value={['LONDRINA, CAMBÉ, IBIPORÃ E REGIÃO METROPOLITANA'].includes(selectedReport.localDestino) ? selectedReport.localDestino : 'outro'}
                      onChange={(e) => {
                        if (e.target.value !== 'outro') updateReport({ localDestino: e.target.value });
                      }}
                      disabled={selectedReport.consolidated}
                      className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    >
                      <option value="LONDRINA, CAMBÉ, IBIPORÃ E REGIÃO METROPOLITANA">LONDRINA, CAMBÉ, IBIPORÃ E REGIÃO METROPOLITANA</option>
                      <option value="outro">Outro (manual)</option>
                    </select>
                    {(!['LONDRINA, CAMBÉ, IBIPORÃ E REGIÃO METROPOLITANA'].includes(selectedReport.localDestino) || selectedReport.localDestino === 'outro') && (
                      <input 
                        type="text" 
                        value={selectedReport.localDestino === 'outro' ? '' : selectedReport.localDestino}
                        onChange={(e) => updateReport({ localDestino: e.target.value })}
                        disabled={selectedReport.consolidated}
                        className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors mt-2"
                        placeholder="Local de Destino Manual"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Motivo da Viagem</label>
                    <select 
                      value={['REUNIÕES, CONVOCAÇÕES E VISITAS PASTORAIS'].includes(selectedReport.motivoViagem) ? selectedReport.motivoViagem : 'outro'}
                      onChange={(e) => {
                        if (e.target.value !== 'outro') updateReport({ motivoViagem: e.target.value });
                      }}
                      disabled={selectedReport.consolidated}
                      className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    >
                      <option value="REUNIÕES, CONVOCAÇÕES E VISITAS PASTORAIS">REUNIÕES, CONVOCAÇÕES E VISITAS PASTORAIS</option>
                      <option value="outro">Outro (manual)</option>
                    </select>
                    {(!['REUNIÕES, CONVOCAÇÕES E VISITAS PASTORAIS'].includes(selectedReport.motivoViagem) || selectedReport.motivoViagem === 'outro') && (
                      <input 
                        type="text" 
                        value={selectedReport.motivoViagem === 'outro' ? '' : selectedReport.motivoViagem}
                        onChange={(e) => updateReport({ motivoViagem: e.target.value })}
                        disabled={selectedReport.consolidated}
                        className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors mt-2"
                        placeholder="Motivo Manual"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Função/Cargo</label>
                    <select 
                      value={selectedReport.role}
                      onChange={(e) => updateReport({ role: e.target.value })}
                      disabled={selectedReport.consolidated}
                      className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    >
                      {['Supervisor', 'Superintendente/Diretor de Campo', 'Coordenador', 'Pastor', 'Funcionário'].map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">No. Recibo</label>
                    <input 
                      type="text" 
                      value={selectedReport.noRecibo}
                      onChange={(e) => updateReport({ noRecibo: e.target.value })}
                      disabled={selectedReport.consolidated}
                      className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Data</label>
                    <input 
                      type="date" 
                      value={selectedReport.data}
                      onChange={(e) => updateReport({ data: e.target.value })}
                      disabled={selectedReport.consolidated}
                      className="w-full border-b-2 border-stone-100 focus:border-blue-600 py-2 text-sm font-bold outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Assinatura</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['none', 'valdir', 'edu'].map(sig => (
                      <button 
                        key={sig}
                        onClick={() => {
                          const updates: Partial<Report> = { assinatura: sig as any };
                          if (sig === 'valdir') updates.nomePorExtenso = 'Rev. Valdir Ávila Ramos';
                          if (sig === 'edu') updates.nomePorExtenso = 'Pr. Eduardo Silva';
                          updateReport(updates);
                        }}
                        disabled={selectedReport.consolidated}
                        className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 disabled:opacity-50 ${selectedReport.assinatura === sig ? 'border-blue-600 bg-blue-50' : 'border-stone-100 hover:border-stone-200'}`}
                      >
                        <div className="h-8 flex items-center justify-center overflow-hidden">
                          {sig === 'none' ? <div className="w-4 h-4 border border-dashed border-stone-300"></div> : <img src={`/${sig}.png`} alt={sig} className="max-h-full object-contain" referrerPolicy="no-referrer" />}
                        </div>
                        <span className="text-[8px] font-bold uppercase">{sig}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setView('preview')}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Visualizar Impressão
                </button>
              </div>

              {/* Summary Card */}
              <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1">Total Consolidado</span>
                  <span className="text-4xl font-black">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-2 pt-6 border-t border-white/10">
                  {CATEGORIES.map(cat => (
                    totalsByCategory[cat.id] > 0 && (
                      <div key={cat.id} className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase opacity-50">{cat.label}</span>
                        <span className="text-xs font-bold">R$ {totalsByCategory[cat.id].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Main Expense Editor */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">Lançamentos Individuais</h2>
                <div className="flex gap-2">
                  {CATEGORIES.slice(0, 3).map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => addExpense(cat.id)}
                      disabled={selectedReport.consolidated}
                      className="bg-white border border-stone-200 hover:border-blue-600 hover:text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      + {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {CATEGORIES.map(category => (
                  <div key={category.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="bg-stone-50 px-6 py-4 flex items-center justify-between border-b border-stone-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs">{category.label}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-stone-400">R$ {totalsByCategory[category.id].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <button 
                          onClick={() => addExpense(category.id)}
                          disabled={selectedReport.consolidated}
                          className="w-8 h-8 bg-white border border-stone-200 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      {expenses.filter(e => e.categoryId === category.id).length === 0 ? (
                        <p className="text-[10px] text-stone-400 italic text-center py-4">Nenhum lançamento nesta categoria.</p>
                      ) : (
                        expenses.filter(e => e.categoryId === category.id).map(expense => (
                          <div key={expense.id} className="flex items-center gap-4 p-2 hover:bg-stone-50 rounded-xl transition-colors group">
                            <div className="flex-1">
                              <input 
                                type="text" 
                                value={expense.receiptNumber}
                                onChange={(e) => updateExpense(expense.id, { receiptNumber: e.target.value })}
                                disabled={selectedReport.consolidated}
                                className="w-full bg-transparent border-b border-stone-100 focus:border-blue-600 py-1 text-sm outline-none transition-colors disabled:opacity-50"
                                placeholder="No. Nota / Recibo"
                              />
                            </div>
                            <div className="w-32 relative">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">R$</span>
                              <input 
                                type="number" 
                                step="0.01"
                                value={expense.value || ''}
                                onChange={(e) => updateExpense(expense.id, { value: parseFloat(e.target.value) || 0 })}
                                disabled={selectedReport.consolidated}
                                className="w-full bg-transparent border-b border-stone-100 focus:border-blue-600 py-1 pl-6 text-sm font-bold text-right outline-none transition-colors disabled:opacity-50"
                                placeholder="0,00"
                              />
                            </div>
                            {!selectedReport.consolidated && (
                              <button 
                                onClick={() => deleteExpense(expense.id)}
                                className="text-stone-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'preview' && selectedReport && (
          <div className="flex flex-col items-center gap-8 pb-20 print:p-0">
            <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] print:shadow-none print:w-full print:min-h-0 print:p-0">
              {/* PDF Mockup Layout */}
              <div className="border-[1.5px] border-black h-full flex flex-col">
                {/* Header */}
                <div className="flex border-b-[1.5px] border-black">
                  <div className="w-32 p-2 border-r-[1.5px] border-black flex items-center justify-center">
                    <img src="/logo.png" alt="IEQ Logo" className="max-h-16 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-center justify-center border-b-[1.5px] border-black py-1">
                      <h1 className="text-sm italic font-bold">Igreja do Evangelho Quadrangular</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <h2 className="text-xl font-black tracking-tighter uppercase">Relatório de Viagens</h2>
                    </div>
                  </div>
                  <div className="w-24 flex flex-col border-l-[1.5px] border-black">
                    <div className="text-[10px] p-1 border-b-[1.5px] border-black text-center">No. Recibo</div>
                    <div className="flex-1 flex items-center justify-center font-bold">{selectedReport.noRecibo}</div>
                  </div>
                </div>

                {/* Travel Details */}
                <div className="grid grid-cols-[150px_1fr] border-b-[1.5px] border-black text-xs">
                  <div className="border-r-[1.5px] border-black p-2 text-right font-bold bg-stone-50 flex items-center justify-end">Local de Saída:</div>
                  <div className="p-2 px-4 uppercase font-bold flex items-center">{selectedReport.localSaida}</div>
                  <div className="border-r-[1.5px] border-black p-2 text-right font-bold bg-stone-50 border-t-[1.5px] border-black flex items-center justify-end">Local de Destino:</div>
                  <div className="p-2 px-4 uppercase font-bold border-t-[1.5px] border-black flex items-center">{selectedReport.localDestino}</div>
                  <div className="border-r-[1.5px] border-black p-2 text-right font-bold bg-stone-50 border-t-[1.5px] border-black flex items-center justify-end">Motivo da Viagem:</div>
                  <div className="p-2 px-4 uppercase font-bold border-t-[1.5px] border-black flex items-center">{selectedReport.motivoViagem}</div>
                </div>

                {/* Middle Section: Roles and Expenses */}
                <div className="flex flex-1 border-b-[1.5px] border-black">
                  {/* Roles */}
                  <div className="w-1/3 border-r-[1.5px] border-black p-4 space-y-3">
                    {['Supervisor', 'Superintendente/Diretor de Campo', 'Coordenador', 'Pastor', 'Funcionário'].map(role => (
                      <div key={role} className="flex items-center gap-3">
                        <div className={`w-5 h-5 border-[1.5px] border-black flex items-center justify-center`}>
                          {selectedReport.role === role && <span className="text-sm font-black leading-none mt-[-2px]">X</span>}
                        </div>
                        <span className="text-[11px] font-bold uppercase">{role}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expenses Table */}
                  <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-[1fr_150px_100px] text-[10px] font-bold text-center border-b-[1.5px] border-black bg-stone-50">
                      <div className="p-1 border-r-[1.5px] border-black">Descrição</div>
                      <div className="p-1 border-r-[1.5px] border-black">No. Nota Fiscal / Recibo</div>
                      <div className="p-1">Total R$</div>
                    </div>
                    <div className="flex-1">
                      {CATEGORIES.map((cat, idx) => (
                        <div key={cat.id} className={`grid grid-cols-[1fr_150px_100px] text-[10px] ${idx !== CATEGORIES.length - 1 ? 'border-b border-black' : ''}`}>
                          <div className="p-1 border-r-[1.5px] border-black font-bold uppercase flex items-center gap-2">
                            <div className="w-3 h-3 border border-black flex items-center justify-center">
                              {totalsByCategory[cat.id] > 0 && <span className="text-[9px] font-black leading-none">X</span>}
                            </div>
                            {cat.label}
                          </div>
                          <div className="p-1 border-r-[1.5px] border-black text-center flex flex-col justify-center overflow-hidden">
                            <div className="truncate">
                              {expenses.filter(e => e.categoryId === cat.id).map(e => e.receiptNumber).filter(Boolean).join(', ')}
                            </div>
                          </div>
                          <div className="p-1 text-right font-bold flex flex-col justify-center">
                            {totalsByCategory[cat.id] > 0 ? totalsByCategory[cat.id].toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Total Geral Row */}
                    <div className="grid grid-cols-[1fr_100px] border-t-[1.5px] border-black">
                      <div className="p-2 text-right font-bold text-xs bg-stone-50 border-r-[1.5px] border-black uppercase italic">Total Geral</div>
                      <div className="p-2 text-right font-black text-sm flex items-center justify-end">
                        {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extenso */}
                <div className="p-2 border-b-[1.5px] border-black">
                  <div className="text-[9px] font-bold uppercase text-stone-500 mb-1">Valor por Extenso</div>
                  <div className="text-xs font-bold italic min-h-[1.5rem] uppercase underline decoration-dotted underline-offset-4">
                    {totalExtenso ? `(${totalExtenso})` : ''}
                  </div>
                </div>

                {/* Declaration */}
                <div className="p-8 space-y-8 text-[13px] leading-relaxed">
                  <p className="text-justify">
                    Eu, <span className="font-bold uppercase border-b border-black px-4 inline-block min-w-[350px] text-center">{selectedReport.nomePorExtenso}</span>, 
                    declaro ter recebido da IEQ em <span className="font-bold uppercase border-b border-black px-4 inline-block min-w-[200px] text-center">{selectedReport.nomeIgreja}</span>, 
                    CNPJ/COD. <span className="font-bold uppercase border-b border-black px-4 inline-block min-w-[180px] text-center">{selectedReport.cnpjCod}</span>, 
                    o valor acima, do qual dou plena quitação.
                  </p>
                </div>

                {/* Footer: Local, Data, Assinatura */}
                <div className="mt-auto p-8 grid grid-cols-3 gap-12 text-[10px] font-bold text-center">
                  <div className="space-y-1">
                    <div className="border-b border-black h-8 flex items-end justify-center uppercase">{selectedReport.cidadeUf}</div>
                    <div>Local</div>
                  </div>
                  <div className="space-y-1">
                    <div className="border-b border-black h-8 flex items-end justify-center uppercase">
                      {selectedReport.data ? format(new Date(selectedReport.data + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
                    </div>
                    <div>Data</div>
                  </div>
                  <div className="space-y-1 relative flex flex-col items-center">
                    <div className="border-b border-black h-8 w-full flex items-end justify-center">
                      {selectedReport.assinatura !== 'none' && (
                        <img 
                          src={`/${selectedReport.assinatura}.png`} 
                          alt="Assinatura" 
                          className={`absolute bottom-6 object-contain ${selectedReport.assinatura === 'valdir' ? 'max-h-24 -bottom-4' : 'max-h-16'}`}
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div>Assinatura</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 print:hidden">
              <button 
                onClick={() => setView('edit')}
                className="bg-stone-200 text-stone-700 font-bold py-3 px-8 rounded-2xl hover:bg-stone-300 transition-all"
              >
                Voltar para Edição
              </button>
              <button 
                onClick={handlePrint}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Imprimir Agora
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background-color: white;
            padding: 0;
            margin: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:min-h-0 {
            min-height: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
