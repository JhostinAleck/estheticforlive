import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getResults, deleteResult, toggleResultActive } from '@/lib/actions/results'
import { revalidatePath } from 'next/cache'

export const metadata = {
  title: 'Resultados Antes/Después | Admin',
}

export default async function ResultadosAdminPage() {
  const results = await getResults()

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteResult(id)
    revalidatePath('/admin/resultados')
  }

  async function handleToggleActive(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const currentActive = formData.get('is_active') === 'true'
    await toggleResultActive(id, !currentActive)
    revalidatePath('/admin/resultados')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Resultados Antes/Después</h1>
          <p className="text-muted">Gestiona las fotos de transformaciones</p>
        </div>
        <Link href="/admin/resultados/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Resultado
          </Button>
        </Link>
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <p className="text-muted mb-4">No hay resultados creados</p>
          <Link href="/admin/resultados/nuevo">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Crear primer resultado
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => {
            const service = result.services as { id: string; name: string } | null
            const category = result.categories as { id: string; name: string } | null

            return (
              <div
                key={result.id}
                className={`bg-white rounded-2xl border border-border overflow-hidden ${
                  !result.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Images */}
                <div className="relative aspect-[4/3] bg-surface">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 relative">
                      <Image
                        src={result.before_image_url}
                        alt="Antes"
                        fill
                        className="object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Antes
                      </span>
                    </div>
                    <div className="w-1/2 relative">
                      <Image
                        src={result.after_image_url}
                        alt="Después"
                        fill
                        className="object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded">
                        Después
                      </span>
                    </div>
                  </div>
                  {!result.is_active && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Oculto
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-secondary mb-1">{result.title}</h3>
                  {result.description && (
                    <p className="text-sm text-muted line-clamp-2 mb-2">{result.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {service && (
                      <span className="bg-accent-light text-accent px-2 py-1 rounded">
                        {service.name}
                      </span>
                    )}
                    {category && (
                      <span className="bg-surface text-muted px-2 py-1 rounded">
                        {category.name}
                      </span>
                    )}
                    <span className="bg-surface text-muted px-2 py-1 rounded flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3" />
                      {result.display_order}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <Link href={`/admin/resultados/${result.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <form action={handleToggleActive}>
                    <input type="hidden" name="id" value={result.id} />
                    <input type="hidden" name="is_active" value={String(result.is_active)} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      title={result.is_active ? 'Ocultar' : 'Mostrar'}
                    >
                      {result.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={result.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
