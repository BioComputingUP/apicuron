import * as _ from "lodash";
import { Deserializable } from "src/app/interfaces/deserializable.model";
import { indicators } from "./indicators";
const sections = {
  IMPACT_INDICATORS: "Impact Indicators",
  CAREER_STAGE_INDICATORS: "Career Stage Indicators",
  OPEN_SCIENCE_INDICATORS: "Open Science Indicators",
  PRODUCTIVITY_INDICATORS: "Productivity Indicators",
} as const;
type SectionType = (typeof sections)[keyof typeof sections];

type SectionMap = {
  [key: string]: {
    label: string;
    section: SectionType;
    description: string;
  };
};

const SECTION_ORDER = [
  sections.IMPACT_INDICATORS,
  sections.PRODUCTIVITY_INDICATORS,
  sections.OPEN_SCIENCE_INDICATORS,
  sections.CAREER_STAGE_INDICATORS,
] as const;

const sections_map: SectionMap = {
  "work_types_num.datasets": {
    label: "Datasets",
    section: sections.PRODUCTIVITY_INDICATORS,
    description: indicators.Datasets,
  },
  "work_types_num.papers": {
    label: "Papers",
    section: sections.PRODUCTIVITY_INDICATORS,
    description: indicators.Publications,
  },
  "work_types_num.software": {
    label: "Software",
    section: sections.PRODUCTIVITY_INDICATORS,
    description: indicators.Software,
  },
  "work_types_num.other": {
    label: "Other Works",
    section: sections.PRODUCTIVITY_INDICATORS,
    description: indicators.Other,
  },
  citations_num: {
    label: "Citations",
    section: sections.IMPACT_INDICATORS,
    description: indicators.Citations,
  },
  h_index: {
    label: "H-index",
    section: sections.IMPACT_INDICATORS,
    description: indicators["h-index"],
  },
  popular_works_count: {
    label: "Popular Works",
    section: sections.IMPACT_INDICATORS,
    description: indicators.Popular,
  },
  influential_works_count: {
    label: "Influential Works",
    section: sections.IMPACT_INDICATORS,
    description: indicators.Influential,
  },
  "openness.open_percentage": {
    label: "Open Access Share",
    section: sections.OPEN_SCIENCE_INDICATORS,
    description: indicators.OAShare,
  },
  "openness.open_papers": {
    label: "Open Access Works",
    section: sections.OPEN_SCIENCE_INDICATORS,
    description: indicators.OAWorks,
  },
  "openness.influential_open_papers": {
    label: "Open Influential Works",
    section: sections.OPEN_SCIENCE_INDICATORS,
    description: indicators.OAInfluential,
  },
  "openness.popular_open_papers": {
    label: "Open Popular Works",
    section: sections.OPEN_SCIENCE_INDICATORS,
    description: indicators.OAPopular,
  },
  academic_age: {
    label: "Academic Age",
    section: sections.CAREER_STAGE_INDICATORS,
    description: indicators.Academic_Age,
  },
  responsible_academic_age: {
    label: "Fair Academic Age",
    section: sections.CAREER_STAGE_INDICATORS,
    description: indicators.Fair_Academic_Age,
  },
};

interface WorkTypes {
  datasets: number;
  papers: number;
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
export type BipScholarSection = {
  title: string;
  stats?: {
    [statKey: string]: {
      label: string;
      value: number;
      description: string;
    };
  };
};

export type BipScholarStatsViewModel = {
  [sectionKey in SectionType]: BipScholarSection;
};

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

  public statCardViewModel(): Array<{ key: string; value: BipScholarSection }> {
    // Groups stats into sections based on the sections_map

    // Build the sections object with the section titles
    const stats: BipScholarStatsViewModel = Object.values(sections).reduce(
      (acc, section) => {
        acc[section] = {
          title: section,
          stats: {},
        };
        return acc;
      },
      {} as BipScholarStatsViewModel
    );

    // Iterate over the sections_map to populate the stats for each section
    Object.keys(sections_map).forEach((key) => {
      const section_title: string = sections_map[key].section;
      const label: string = sections_map[key].label;
      const description: string = sections_map[key].description || "";
      const value = _.get(this, key);

      const stat = {
        label: label,
        value: value,
        description: description,
      };

      if (value !== undefined) {
        stats[section_title].stats[key] = stat;
      }
    });
    return SECTION_ORDER.map((sectionKey) => ({
      key: sectionKey,
      value: stats[sectionKey],
    }));
  }
}
