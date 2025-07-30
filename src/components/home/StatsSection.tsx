import {
  AnimatedSection,
  FadeInCard,
} from '@/components/common/animated-section'

export function StatsSection() {
  const stats = [
    {
      value: '100%',
      label: 'Free to Use',
      delay: 0.1,
    },
    {
      value: '∞',
      label: 'Movies & Shows',
      delay: 0.2,
    },
    {
      value: '📱',
      label: 'Mobile Ready',
      delay: 0.3,
    },
    {
      value: '🔒',
      label: 'Secure & Private',
      delay: 0.4,
    },
  ]

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <AnimatedSection>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <FadeInCard key={stat.label} delay={stat.delay}>
                <div className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="mb-2 text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              </FadeInCard>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}