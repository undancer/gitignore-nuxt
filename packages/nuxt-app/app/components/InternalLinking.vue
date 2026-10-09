<script setup lang="ts">
// internal-linking 区块 —— 迁移自 legacy Resources/Views/internal-linking.leaf + links.json：
// “Skills in High Demand by Toptal Clients” 跑马灯外链条
interface LinkingLink { url: string, title: string }

const { data: links } = await useFetch<LinkingLink[]>('/links.json')
const items = computed(() => links.value ?? [])

// 跑马灯无缝滚动：内容渲染两份，动画平移 -50%（对齐 internal-linking.less 的 ticker keyframes）
const tickerItems = computed(() => [...items.value, ...items.value])
</script>

<template>
  <div class="internal-linking">
    <div class="internal-linking__container">
      <div class="internal-linking__title">
        <img width="12" height="16" src="/img/lightning.svg" alt="">
        <span>
          Skills in High Demand
          <br>
          by Toptal Clients
        </span>
      </div>
      <div class="internal-linking__ticker-list">
        <a
          v-for="(link, i) in tickerItems"
          :key="`${link.url}-${i}`"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="internal-linking__link"
        >
          {{ link.title }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// BEM 复刻 legacy src/less/internal-linking.less；@apply 按分类多行使用
.internal-linking {
  // 布局
  @apply
    w-full
    overflow-hidden
    shrink-0;

  height: 56px;
  flex-basis: 56px;

  @media (max-width: 768px) {
    height: 32px;
    flex-basis: 32px;
  }
}

@keyframes ticker {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.internal-linking__container {
  // 布局
  @apply
    flex
    items-center
    w-full
    overflow-hidden;

  height: 56px;
  color: var(--colors-brand-white);
  background-color: var(--colors-brand-darkBlue);

  .internal-linking__title {
    // 布局
    @apply
      flex
      items-center
      h-full
      shrink-0
      uppercase;

    z-index: 1;
    color: var(--colors-brand-blue);
    font-weight: 600;
    font-size: 10px;
    line-height: 12px;
    background-color: var(--colors-brand-white);

    img {
      margin: 22px 8px 18px 24px;
    }

    span {
      margin: 16px 24px 16px 0;
      white-space: nowrap;
    }
  }

  .internal-linking__ticker-list {
    // 布局
    @apply
      flex
      flex-row;

    font-size: 12px;
    line-height: 16px;
    animation:
      ticker 180s linear infinite;

    &:hover {
      animation-play-state: paused;
    }

    .internal-linking__link {
      // 布局
      @apply
        whitespace-nowrap;

      margin: 20px 28px;
      padding: 5px 12px 3px;
      color: var(--colors-brand-white);
      text-decoration: underline;
    }
  }
}

@media (max-width: 768px) {
  .internal-linking__container {
    height: 32px;
    border: none;
    box-shadow: none;

    .internal-linking__title {
      img {
        margin: 8px;
      }

      span {
        margin: 6px 16px 6px 0;
        font-size: 8px;
        line-height: 10px;
      }
    }

    .internal-linking__ticker-list {
      .internal-linking__link {
        // 布局 + 视觉
        @apply
          whitespace-nowrap
          rounded-2xl;

        margin: 4px 16px;
        text-decoration: none;
        border: 1px solid var(--colors-brand-white);
      }
    }
  }
}
</style>
