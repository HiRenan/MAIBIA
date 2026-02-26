export type SocialLinkName = 'LinkedIn' | 'GitHub' | 'Dev.to'

export interface SocialLink {
  name: SocialLinkName
  url: string
  color: string
  ariaLabelKey: string
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/renan-mocelin-br/',
    color: '#0a66c2',
    ariaLabelKey: 'tavern.social.openLinkedIn',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/HiRenan',
    color: '#e2e8f0',
    ariaLabelKey: 'tavern.social.openGithub',
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/hirenan',
    color: '#e2e8f0',
    ariaLabelKey: 'tavern.social.openDevto',
  },
]
