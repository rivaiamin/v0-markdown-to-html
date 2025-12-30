<script>
  import { parseMarkdownToComponents } from '$lib/parser';
  import Hero from '$lib/components/Hero.svelte';
  import Cards from '$lib/components/Cards.svelte';
  import Logos from '$lib/components/Logos.svelte';
  import CTA from '$lib/components/CTA.svelte';
  import { onMount } from 'svelte';

  let markdown = $state(`<!--hero-->
# Modern App Builder
Experience the future of development with our AI-powered markdown to landing page engine. Build faster, design better.
* [Get Started](https://v0.app)
* [Watch Demo](#)

![Hero Image](https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop)
<!--/hero-->

<!--logos-->
* ![Nextjs](https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg)
* ![Tailwind](https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg)
* ![Svelte](https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg)
<!--/logos-->

<!--cards-->
## Powerful Features
* ![Speed](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2340&auto=format&fit=crop) **Lighting Fast** Our engine transforms markdown into optimized HTML in milliseconds. [Learn More](/features)
* ![Design](https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2340&auto=format&fit=crop) **Customizable Styles** Easily adjust the tailwind theme to match your brand identity. [Explore](/styles)
* ![SEO](https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?q=80&w=2348&auto=format&fit=crop) **SEO Optimized** Automatically generates semantic HTML tags for search engines. [Read Guide](/seo)
<!--/cards-->

<!--cta-->
### Ready to Build?
Stop wasting hours on boilerplate and start focusing on your content. Our converter handles the rest.
[Launch Project](https://v0.app)
<!--/cta-->`);

  let components = $derived(parseMarkdownToComponents(markdown));
  let isEditing = $state(true);

  const componentMap = {
    hero: Hero,
    cards: Cards,
    logos: Logos,
    cta: CTA
  };
</script>

<div class="flex flex-col h-screen">
  <!-- Header -->
  <header class="p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white italic">M</div>
      <h1 class="text-xl font-bold tracking-tight">MD <span class="text-primary">Styler</span></h1>
    </div>
    <div class="flex gap-2">
      <button 
        onclick={() => isEditing = true}
        class="px-4 py-2 rounded-md transition-colors {isEditing ? 'bg-primary text-white' : 'hover:bg-accent'}"
      >
        Editor
      </button>
      <button 
        onclick={() => isEditing = false}
        class="px-4 py-2 rounded-md transition-colors {!isEditing ? 'bg-primary text-white' : 'hover:bg-accent'}"
      >
        Preview
      </button>
    </div>
  </header>

  <main class="flex-1 overflow-hidden">
    {#if isEditing}
      <div class="flex h-full">
        <div class="w-1/2 h-full border-r border-border p-4">
          <textarea 
            bind:value={markdown}
            class="w-full h-full bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
            placeholder="Paste your markdown here..."
          ></textarea>
        </div>
        <div class="w-1/2 h-full bg-slate-900/50 overflow-auto p-8 prose prose-invert">
          <div class="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest">Live Structure Map</div>
          {#each components as comp}
            <div class="mb-2 p-3 rounded-lg border border-border bg-card flex items-center justify-between">
              <span class="font-bold text-primary">{comp.type.toUpperCase()}</span>
              <span class="text-xs text-muted-foreground opacity-50 truncate max-w-[200px]">{comp.title || comp.content || ''}</span>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="h-full overflow-auto">
        {#each components as comp}
          {#if componentMap[comp.type]}
            {@const Component = componentMap[comp.type]}
            <Component {...comp} />
          {:else}
            <div class="container mx-auto px-4 py-12 prose prose-invert">
              <p>{comp.content}</p>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </main>
</div>
