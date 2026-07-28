export interface DemoFarmState {
  companyName: string;
  printersCount: number;
  ordersCount: number;
  clientsCount: number;
  stlModelsCount: number;
  filamentsCount: number;
  activeJobs: Array<{ id: string; printer: string; progress: number; model: string }>;
}

export function getMakerLabDemoData(): DemoFarmState {
  return {
    companyName: "MakerLab 3D — Fazenda Modelo",
    printersCount: 5,
    ordersCount: 120,
    clientsCount: 38,
    stlModelsCount: 20,
    filamentsCount: 10,
    activeJobs: [
      { id: "j1", printer: "Bambu Lab X1-Carbon #01", progress: 85, model: "Suporte Xbox Elite v2" },
      { id: "j2", printer: "Ender 3 S1 Pro #02", progress: 42, model: "Engrenagem Helicoidal M1.5" },
      { id: "j3", printer: "Voron 2.4 #03", progress: 91, model: "Capa Protetora Sensor NPN" },
      { id: "j4", printer: "Prusa MK4 #04", progress: 15, model: "Action Figure Dragon SLA" },
    ],
  };
}
