export interface AboutSiteFact {
  label: string;
  value: string;
}

export interface AboutProfile {
  eyebrow: string;
  title: string;
  introduction: string;
  personalTitle: string;
  personalBody: string;
  quote: string;
  siteTitle: string;
  siteBody: string;
  siteFacts: AboutSiteFact[];
  updatedAt: string;
}

export interface AboutProfileResponse {
  data: AboutProfile;
}
