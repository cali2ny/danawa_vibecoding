import express from "express";
import serverless from "serverless-http";
import { z } from "zod";

const app = express();
app.use(express.json());

type Nation = "domestic" | "export";

interface RadarModel {
  rank: number;
  prevRank: number | null;
  modelName: string;
  brand: string;
  sales: number;
  prevSales: number;
  momAbs: number;
  momPct: number;
  rankChange: number;
  score: number;
  originalUrl: string;
}

interface RadarData {
  month: string;
  nation: Nation;
  models: RadarModel[];
  fetchedAt: string;
}

const DOMESTIC_BRANDS = [
  "현대", "기아", "제네시스", "쉐보레", "르노코리아", "KG모빌리티"
];

const IMPORT_BRANDS = [
  "BMW", "벤츠", "아우디", "폭스바겐", "볼보", "렉서스", "토요타", 
  "혼다", "포르쉐", "랜드로버", "재규어", "미니", "푸조", "페라리",
  "람보르기니", "마세라티", "지프", "캐딜락", "링컨", "포드"
];

const DOMESTIC_MODELS: Record<string, string[]> = {
  "현대": ["아반떼", "쏘나타", "그랜저", "투싼", "싼타페", "팰리세이드", "코나", "아이오닉5", "아이오닉6", "캐스퍼", "스타리아"],
  "기아": ["K3", "K5", "K8", "K9", "셀토스", "스포티지", "쏘렌토", "카니발", "EV6", "EV9", "니로", "모닝", "레이"],
  "제네시스": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  "쉐보레": ["트레일블레이저", "이쿼녹스", "트래버스", "타호", "볼트EUV", "스파크", "말리부"],
  "르노코리아": ["QM6", "XM3", "SM6", "마스터", "아르카나"],
  "KG모빌리티": ["토레스", "액티언", "코란도", "렉스턴", "티볼리"]
};

const IMPORT_MODELS: Record<string, string[]> = {
  "BMW": ["3시리즈", "5시리즈", "7시리즈", "X3", "X5", "X7", "iX", "i4", "i7"],
  "벤츠": ["C클래스", "E클래스", "S클래스", "GLC", "GLE", "GLS", "EQE", "EQS"],
  "아우디": ["A4", "A6", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron"],
  "폭스바겐": ["골프", "티구안", "투아렉", "ID.4", "아테온", "파사트"],
  "볼보": ["S60", "S90", "XC40", "XC60", "XC90", "EX30", "EX90"],
  "렉서스": ["ES", "LS", "NX", "RX", "UX", "LX"],
  "토요타": ["캠리", "프리우스", "RAV4", "하이랜더", "크라운"],
  "혼다": ["어코드", "시빅", "CR-V", "HR-V", "파일럿"],
  "포르쉐": ["911", "카이엔", "마칸", "타이칸", "파나메라"],
  "랜드로버": ["디펜더", "레인지로버", "레인지로버스포츠", "디스커버리"],
  "재규어": ["XE", "XF", "F-PACE", "E-PACE", "I-PACE"],
  "미니": ["쿠퍼", "컨트리맨", "클럽맨"],
  "푸조": ["208", "308", "3008", "5008"],
  "지프": ["랭글러", "그랜드체로키", "컴패스", "글래디에이터"],
};

const nationSchema = z.enum(["domestic", "export"]);

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  nation: nationSchema
});

function zScore(values: number[]): number[] {
  if (values.length === 0) return [];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length) || 1;
  return values.map(v => (v - mean) / std);
}

function calculateScores(models: RadarModel[]): RadarModel[] {
  const candidates = models.filter(m => m.momAbs > 0);
  if (candidates.length === 0) return models;

  const momAbsValues = candidates.map(m => m.momAbs);
  const momPctValues = candidates.map(m => Math.min(m.momPct, 5));
  const rankChangeValues = candidates.map(m => m.rankChange);

  const zMomAbs = zScore(momAbsValues);
  const zMomPct = zScore(momPctValues);
  const zRankChange = zScore(rankChangeValues);

  const candidateScores = new Map<string, number>();
  candidates.forEach((m, i) => {
    const score = 0.55 * zMomAbs[i] + 0.35 * zMomPct[i] + 0.10 * zRankChange[i];
    candidateScores.set(`${m.brand}-${m.modelName}`, score);
  });

  return models.map(m => {
    const key = `${m.brand}-${m.modelName}`;
    return {
      ...m,
      score: candidateScores.get(key) ?? 0
    };
  });
}

function generateMockData(month: string, nation: Nation): RadarModel[] {
  const brands = nation === "domestic" ? DOMESTIC_BRANDS : IMPORT_BRANDS;
  const modelMap = nation === "domestic" ? DOMESTIC_MODELS : IMPORT_MODELS;
  
  const seed = month.replace("-", "") + nation;
  let rand = 0;
  for (let i = 0; i < seed.length; i++) {
    rand = ((rand << 5) - rand + seed.charCodeAt(i)) | 0;
  }
  const random = () => {
    rand = (rand * 1103515245 + 12345) & 0x7fffffff;
    return rand / 0x7fffffff;
  };

  const models: RadarModel[] = [];
  
  brands.forEach(brand => {
    const brandModels = modelMap[brand] || [];
    brandModels.forEach(modelName => {
      const baseSales = nation === "domestic" 
        ? Math.floor(random() * 8000) + 500
        : Math.floor(random() * 3000) + 100;
      
      const changePercent = (random() - 0.4) * 0.6;
      const prevSales = Math.max(0, Math.floor(baseSales / (1 + changePercent)));
      const sales = baseSales;
      const momAbs = sales - prevSales;
      const momPct = prevSales > 0 ? momAbs / prevSales : (sales > 0 ? 5 : 0);

      const baseUrl = nation === "domestic" 
        ? `https://auto.danawa.com/auto/?Month=${month}-00&Nation=domestic&Tab=Model&Work=record`
        : `https://auto.danawa.com/auto/?Month=${month}-00&Nation=export&Tab=Model&Work=record`;

      models.push({
        rank: 0,
        prevRank: null,
        modelName,
        brand,
        sales,
        prevSales,
        momAbs,
        momPct,
        rankChange: 0,
        score: 0,
        originalUrl: baseUrl
      });
    });
  });

  models.sort((a, b) => b.sales - a.sales);
  models.forEach((m, i) => {
    m.rank = i + 1;
  });

  const shuffled = [...models].sort(() => random() - 0.5);
  shuffled.forEach((m, i) => {
    m.prevRank = i + 1;
    m.rankChange = m.prevRank - m.rank;
  });

  return calculateScores(models);
}

function getRadarData(month: string, nation: Nation): RadarData {
  const models = generateMockData(month, nation);
  return {
    month,
    nation,
    models,
    fetchedAt: new Date().toISOString()
  };
}

const router = express.Router();

router.get("/radar", (req, res) => {
  try {
    const parsed = querySchema.safeParse({
      month: req.query.month,
      nation: req.query.nation
    });

    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid parameters",
        details: parsed.error.errors 
      });
    }

    const { month, nation } = parsed.data;
    const data = getRadarData(month, nation);
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching radar data:", error);
    res.status(500).json({ error: "Failed to fetch radar data" });
  }
});

app.use("/.netlify/functions/api", router);

export const handler = serverless(app);
