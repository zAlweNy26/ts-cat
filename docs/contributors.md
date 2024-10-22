---
layout: page
---

<script setup>
import { VPTeamPage, VPTeamPageTitle, VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/pieroit.png',
    name: 'Piero Savastano',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/pieroit' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/piero-savastano-523b3016' },
      { icon: 'youtube', link: 'https://www.youtube.com/@PieroSavastano' }
    ]
  },
  {
    avatar: 'https://www.github.com/zAlweNy26.png',
    name: 'Daniele Nicosia',
    title: 'Main contributor',
    links: [
      { icon: 'github', link: 'https://github.com/zAlweNy26' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/daniele-nicosia' }
    ]
  }
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Contributors
    </template>
    <template #lead>
      The people who have contributed the most to the project and can be defined as the core team.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="members" />
</VPTeamPage>
