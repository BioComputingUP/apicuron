import { Deserializable } from "src/app/interfaces/deserializable.model";

const sections = {
  PRODUCTIVITY_INDICATORS: "Productivity Indicators",
  IMPACT_INDICATORS: "Impact Indicators",
  OPEN_SCIENCE_INDICATORS: "Open science indicators",
  CAREER_STAGE_INDICATORS: "Career Stage Indicators",
};

const sections_map = {
  "work_types_num.papers": {
    label: "papers",
    section: sections.PRODUCTIVITY_INDICATORS,
  },
  "work_types_num.datasets": {
    label: "datasets",
    section: sections.PRODUCTIVITY_INDICATORS,
  },
  "work_types_num.software": {
    label: "software",
    section: sections.PRODUCTIVITY_INDICATORS,
  },
  "work_types_num.other": {
    label: "other",
    section: sections.PRODUCTIVITY_INDICATORS,
  },
  citations_num: {
    label: "citations_num",
    section: sections.IMPACT_INDICATORS,
  },
  h_index: {
    label: "h_index",
    section: sections.IMPACT_INDICATORS,
  },
  popular_works_count: {
    label: "popular_works_count",
    section: sections.IMPACT_INDICATORS,
  },
  influential_works_count: {
    label: "influential_works_count",
    section: sections.IMPACT_INDICATORS,
  },
  "openness.open_percentage": {
    label: "open_percentage",
    section: sections.OPEN_SCIENCE_INDICATORS,
  },
  "openness.open_papers": {
    label: "open_papers",
    section: sections.OPEN_SCIENCE_INDICATORS,
  },
  "openness.influential_open_papers": {
    label: "influential_open_papers",
    section: sections.OPEN_SCIENCE_INDICATORS,
  },
  "openness.popular_open_papers": {
    label: "popular_open_papers",
    section: sections.OPEN_SCIENCE_INDICATORS,
  },
  academic_age: {
    label: "academic_age",
    section: sections.CAREER_STAGE_INDICATORS,
  },
  responsible_academic_age: {
    label: "responsible_academic_age",
    section: sections.CAREER_STAGE_INDICATORS,
  },
};

interface WorkTypes {
  papers: number;
  datasets: number;
  software: number;
  other: number;
}

interface MetricValue {
  number: string;
  exponent: string;
}

interface OpennessStats {
  open_percentage: number;
  known_papers: number;
  open_papers: number;
  influential_open_papers: number;
  popular_open_papers: number;
}

export interface StatItem {
  label: string;
  value: string | number | undefined;
}
export interface StatCardViewModel {
  title: string;
  stats: StatItem[];
}

export class BipScholarStats implements Deserializable {
  work_types_num?: WorkTypes;
  citations_num?: number;
  h_index?: number;
  i10_index?: number;
  popular_works_count?: number;
  influential_works_count?: number;
  popularity?: MetricValue;
  influence?: MetricValue;
  impulse?: number;
  openness?: OpennessStats;
  paper_min_year?: number;
  academic_age?: number;
  responsible_academic_age?: number;

  deserialize(input: any): this {
    this.work_types_num = input.work_types_num ?? {};
    this.citations_num = input.citations_num ?? 0;
    this.h_index = input.h_index ?? 0;
    this.i10_index = input.i10_index ?? 0;
    this.popular_works_count = input.popular_works_count ?? 0;
    this.influential_works_count = input.influential_works_count ?? 0;
    this.popularity = input.popularity ?? { number: "0", exponent: "E0" };
    this.influence = input.influence ?? { number: "0", exponent: "E0" };
    this.impulse = input.impulse ?? 0;
    this.openness = input.openness ?? {
      open_percentage: 0,
      known_papers: 0,
      open_papers: 0,
      influential_open_papers: 0,
      popular_open_papers: 0,
    };
    this.paper_min_year = input.paper_min_year ?? 0;
    this.academic_age = input.academic_age ?? 0;
    this.responsible_academic_age = input.responsible_academic_age ?? 0;
    return this;
  }

  public statCardViewModel(): StatCardViewModel[] {
    const stats: StatCardViewModel[] = [];
    if (this.work_types_num) {
      stats.push({
        title: "Productivity Indicators",
        stats: [
          { label: "Publications", value: this.work_types_num.papers },
          { label: "Datasets", value: this.work_types_num.datasets },
          { label: "Software", value: this.work_types_num.software },
          { label: "Other Works", value: this.work_types_num.other },
        ],
      });

      if (
        this.citations_num ||
        this.h_index ||
        this.popular_works_count ||
        this.influential_works_count
      ) {
        stats.push({
          title: "Impact Indicators",
          stats: [
            { label: "Citations", value: this.citations_num },
            { label: "H-index", value: this.h_index },
            // { label: "i10-index", value: this.i10_index },
            { label: "Popular Works", value: this.popular_works_count },
            { label: "Influential Works", value: this.influential_works_count },
          ],
        });
      }
      if (this.openness) {
        stats.push({
          title: "Open science indicators",
          stats: [
            {
              label: "Open Acces Share",
              value: this.openness.open_percentage,
            },
            { label: "Open Access Work", value: this.openness.open_papers },
            {
              label: "Influential Open Access Work",
              value: this.openness.influential_open_papers,
            },
            {
              label: "Popular Open Access Work",
              value: this.openness.popular_open_papers,
            },
          ],
        });
      }

      if (this.academic_age || this.responsible_academic_age) {
        stats.push({
          title: "Career Stage Indicators",
          stats: [
            { label: "Academic Age", value: this.academic_age },
            {
              label: "Fair Academic Age",
              value: this.responsible_academic_age,
            },
          ],
        });
      }
    }
    return stats;
  }
}
