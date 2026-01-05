import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getStaffList, deleteStaff, toggleStaffActive } from '@/lib/actions/staff'
import { revalidatePath } from 'next/cache'

export const metadata = {
  title: 'Personal | Admin',
}

export default async function PersonalAdminPage() {
  const staffList = await getStaffList()

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteStaff(id)
    revalidatePath('/admin/personal')
  }

  async function handleToggleActive(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const currentActive = formData.get('is_active') === 'true'
    await toggleStaffActive(id, !currentActive)
    revalidatePath('/admin/personal')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-secondary">Personal</h1>
          <p className="text-sm md:text-base text-muted">Gestiona tu equipo de trabajo</p>
        </div>
        <Link href="/admin/personal/nuevo">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Personal
          </Button>
        </Link>
      </div>

      {/* Staff Grid */}
      {staffList.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-border">
          <p className="text-muted mb-4">No hay personal registrado</p>
          <Link href="/admin/personal/nuevo">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Agregar primer miembro
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className={`bg-white rounded-2xl border border-border overflow-hidden ${
                !staff.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Header with color */}
              <div
                className="h-2"
                style={{ backgroundColor: staff.color }}
              />

              {/* Content */}
              <div className="p-4 md:p-5">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shrink-0"
                    style={{ backgroundColor: staff.color }}
                  >
                    {staff.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary truncate">{staff.name}</h3>
                    {staff.specialty && (
                      <p className="text-sm text-muted truncate">{staff.specialty}</p>
                    )}

                    <div className="mt-2 space-y-1">
                      {staff.phone && (
                        <a
                          href={`tel:${staff.phone}`}
                          className="flex items-center gap-1 text-xs text-muted hover:text-accent"
                        >
                          <Phone className="w-3 h-3" />
                          <span className="truncate">{staff.phone}</span>
                        </a>
                      )}
                      {staff.email && (
                        <a
                          href={`mailto:${staff.email}`}
                          className="flex items-center gap-1 text-xs text-muted hover:text-accent"
                        >
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{staff.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services */}
                {staff.staff_services && staff.staff_services.length > 0 && (
                  <div className="mt-3 md:mt-4">
                    <p className="text-xs text-muted mb-2">Servicios asignados:</p>
                    <div className="flex flex-wrap gap-1">
                      {staff.staff_services.slice(0, 3).map((ss) => (
                        <span
                          key={ss.service_id}
                          className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded"
                        >
                          {ss.services?.name || 'Servicio'}
                        </span>
                      ))}
                      {staff.staff_services.length > 3 && (
                        <span className="text-xs bg-surface text-muted px-2 py-0.5 rounded">
                          +{staff.staff_services.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Status badges */}
                <div className="flex gap-2 mt-3 md:mt-4">
                  {!staff.is_active && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      Inactivo
                    </span>
                  )}
                  {!staff.can_receive_appointments && staff.is_active && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      No recibe citas
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 md:px-5 pb-4 md:pb-5 flex gap-2">
                <Link href={`/admin/personal/${staff.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                    <Pencil className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Editar
                  </Button>
                </Link>
                <form action={handleToggleActive}>
                  <input type="hidden" name="id" value={staff.id} />
                  <input type="hidden" name="is_active" value={String(staff.is_active)} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    title={staff.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {staff.is_active ? (
                      <EyeOff className="w-3 h-3 md:w-4 md:h-4" />
                    ) : (
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                  </Button>
                </form>
                <form action={handleDelete}>
                  <input type="hidden" name="id" value={staff.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
