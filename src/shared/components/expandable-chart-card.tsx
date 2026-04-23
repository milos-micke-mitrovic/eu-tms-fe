import {
  useState,
  useRef,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'

const ChartExpandedContext = createContext(false)

export function useChartExpanded() {
  return useContext(ChartExpandedContext)
}

type ExpandableChartCardProps = {
  title: string
  children: ReactNode
  expandedContent?: ReactNode
}

function findScrollContainer(el: HTMLElement | null): HTMLElement | null {
  let current = el
  while (current) {
    const style = getComputedStyle(current)
    if (style.position === 'relative' && style.overflow === 'auto') {
      return current
    }
    current = current.parentElement
  }
  return null
}

function setOverflow(el: HTMLElement | null, value: string) {
  if (el) el.style.overflow = value
}

export function ExpandableChartCard({
  title,
  children,
  expandedContent,
}: ExpandableChartCardProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const expand = useCallback(() => {
    const container = findScrollContainer(cardRef.current)
    if (container) {
      container.scrollTop = 0
      setOverflow(container, 'hidden')
      setPortalTarget(container)
    }
  }, [])

  const collapse = useCallback(() => {
    setPortalTarget((prev) => {
      setOverflow(prev, '')
      return null
    })
  }, [])

  const expanded = portalTarget !== null
  const { t } = useTranslation('common')

  return (
    <>
      <div
        ref={cardRef}
        className="rounded-lg border p-4"
        role="figure"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={expand}
            aria-label={t('aria.expand')}
          >
            <Maximize2 className="size-4" />
          </Button>
        </div>
        <ChartExpandedContext.Provider value={false}>
          {children}
        </ChartExpandedContext.Provider>
      </div>

      {expanded &&
        createPortal(
          <div className="bg-background absolute inset-0 z-10 flex flex-col p-6">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={collapse}
                aria-label={t('aria.collapse')}
              >
                <Minimize2 className="size-4" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="h-full w-full">
                <ChartExpandedContext.Provider value={true}>
                  {expandedContent ?? children}
                </ChartExpandedContext.Provider>
              </div>
            </div>
          </div>,
          portalTarget
        )}
    </>
  )
}
