'use client'

import { useState, useEffect } from 'react'
import {
  CalendarOff,
  Clock,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  getBusinessHours,
  updateBusinessHours,
  getSpecialDates,
  createSpecialDate,
  deleteSpecialDate,
  getTimeBlocks,
  createTimeBlock,
  deleteTimeBlock,
} from '@/lib/actions/schedule'

interface BusinessHour {
  id: string
  day_of_week: string
  open_time: string
  close_time: string
  is_closed: boolean
}

interface SpecialDate {
  id: string
  date: string
  description: string | null
  is_closed: boolean
  open_time: string | null
  close_time: string | null
}

interface TimeBlock {
  id: string
  start_datetime: string
  end_datetime: string
  reason: string | null
}

const dayNames: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export default function HorariosPage() {
  const [activeTab, setActiveTab] = useState<'hours' | 'special' | 'blocks'>('hours')
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([])
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [newSpecialDate, setNewSpecialDate] = useState({
    date: '',
    description: '',
    is_closed: true,
    open_time: '08:00',
    close_time: '18:00',
  })

  const [newTimeBlock, setNewTimeBlock] = useState({
    date: '',
    start_time: '08:00',
    end_time: '12:00',
    reason: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [hours, dates, blocks] = await Promise.all([
      getBusinessHours(),
      getSpecialDates(),
      getTimeBlocks(),
    ])
    setBusinessHours(hours as BusinessHour[])
    setSpecialDates(dates as SpecialDate[])
    setTimeBlocks(blocks as TimeBlock[])
    setLoading(false)
  }

  async function handleUpdateBusinessHour(day: string, field: string, value: string | boolean) {
    const hour = businessHours.find(h => h.day_of_week === day)
    if (!hour) return

    const updated = { ...hour, [field]: value }
    setBusinessHours(prev => prev.map(h => h.day_of_week === day ? updated : h))

    setSaving(true)
    await updateBusinessHours(day, {
      open_time: updated.open_time,
      close_time: updated.close_time,
      is_closed: updated.is_closed,
    })
    setSaving(false)
  }

  async function handleAddSpecialDate() {
    if (!newSpecialDate.date) return

    setSaving(true)
    const result = await createSpecialDate(newSpecialDate)
    if (result.success) {
      setNewSpecialDate({
        date: '',
        description: '',
        is_closed: true,
        open_time: '08:00',
        close_time: '18:00',
      })
      await loadData()
    }
    setSaving(false)
  }

  async function handleDeleteSpecialDate(id: string) {
    if (!confirm('¿Eliminar esta fecha especial?')) return

    setSaving(true)
    await deleteSpecialDate(id)
    await loadData()
    setSaving(false)
  }

  async function handleAddTimeBlock() {
    if (!newTimeBlock.date || !newTimeBlock.start_time || !newTimeBlock.end_time) return

    const start_datetime = `${newTimeBlock.date}T${newTimeBlock.start_time}:00`
    const end_datetime = `${newTimeBlock.date}T${newTimeBlock.end_time}:00`

    setSaving(true)
    const result = await createTimeBlock({
      start_datetime,
      end_datetime,
      reason: newTimeBlock.reason || undefined,
    })
    if (result.success) {
      setNewTimeBlock({
        date: '',
        start_time: '08:00',
        end_time: '12:00',
        reason: '',
      })
      await loadData()
    }
    setSaving(false)
  }

  async function handleDeleteTimeBlock(id: string) {
    if (!confirm('¿Eliminar este bloqueo de horario?')) return

    setSaving(true)
    await deleteTimeBlock(id)
    await loadData()
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Horarios</h1>
        <p className="text-gray-500 mt-1">Configura horarios de trabajo, días cerrados y bloqueos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'hours'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Clock className="w-4 h-4 inline-block mr-2" />
          Horario Semanal
        </button>
        <button
          onClick={() => setActiveTab('special')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'special'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Calendar className="w-4 h-4 inline-block mr-2" />
          Fechas Especiales
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'blocks'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <CalendarOff className="w-4 h-4 inline-block mr-2" />
          Bloqueos de Horario
        </button>
      </div>

      {/* Business Hours Tab */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Horario de Atención Semanal</h2>
            {saving && <span className="text-sm text-gray-500">Guardando...</span>}
          </div>

          <div className="space-y-4">
            {businessHours.map((hour) => (
              <div
                key={hour.day_of_week}
                className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-28 font-medium text-gray-900">
                  {dayNames[hour.day_of_week]}
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!hour.is_closed}
                    onChange={(e) => handleUpdateBusinessHour(hour.day_of_week, 'is_closed', !e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-gray-700">Abierto</span>
                </label>

                {!hour.is_closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-500">Desde:</label>
                      <input
                        type="time"
                        value={hour.open_time}
                        onChange={(e) => handleUpdateBusinessHour(hour.day_of_week, 'open_time', e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-500">Hasta:</label>
                      <input
                        type="time"
                        value={hour.close_time}
                        onChange={(e) => handleUpdateBusinessHour(hour.day_of_week, 'close_time', e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      />
                    </div>
                  </>
                )}

                {hour.is_closed && (
                  <span className="text-sm text-red-600 font-medium">Cerrado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Dates Tab */}
      {activeTab === 'special' && (
        <div className="space-y-6">
          {/* Add new special date */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Agregar Fecha Especial</h2>
            <p className="text-sm text-gray-500 mb-4">
              Usa esto para marcar festivos, vacaciones o días con horario especial
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={newSpecialDate.date}
                  onChange={(e) => setNewSpecialDate(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newSpecialDate.description}
                  onChange={(e) => setNewSpecialDate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Día festivo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={newSpecialDate.is_closed ? 'closed' : 'special'}
                  onChange={(e) => setNewSpecialDate(prev => ({ ...prev, is_closed: e.target.value === 'closed' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  <option value="closed">Cerrado todo el día</option>
                  <option value="special">Horario especial</option>
                </select>
              </div>

              {!newSpecialDate.is_closed && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                    <input
                      type="time"
                      value={newSpecialDate.open_time}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, open_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                    <input
                      type="time"
                      value={newSpecialDate.close_time}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, close_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAddSpecialDate}
              disabled={!newSpecialDate.date || saving}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Agregar Fecha
            </button>
          </div>

          {/* List of special dates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Fechas Especiales Registradas</h2>

            {specialDates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay fechas especiales registradas</p>
            ) : (
              <div className="space-y-3">
                {specialDates.map((date) => (
                  <div
                    key={date.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${date.is_closed ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {date.is_closed ? <CalendarOff className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(parseISO(date.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {date.description || (date.is_closed ? 'Cerrado' : `${date.open_time} - ${date.close_time}`)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSpecialDate(date.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Blocks Tab */}
      {activeTab === 'blocks' && (
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                Los bloqueos de horario te permiten reservar horas específicas para reuniones,
                descansos o cualquier actividad que no sea atención a clientes.
              </p>
            </div>
          </div>

          {/* Add new time block */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Agregar Bloqueo de Horario</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={newTimeBlock.date}
                  onChange={(e) => setNewTimeBlock(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                <input
                  type="time"
                  value={newTimeBlock.start_time}
                  onChange={(e) => setNewTimeBlock(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                <input
                  type="time"
                  value={newTimeBlock.end_time}
                  onChange={(e) => setNewTimeBlock(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
                <input
                  type="text"
                  value={newTimeBlock.reason}
                  onChange={(e) => setNewTimeBlock(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ej: Reunión, Almuerzo, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <button
              onClick={handleAddTimeBlock}
              disabled={!newTimeBlock.date || !newTimeBlock.start_time || !newTimeBlock.end_time || saving}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Agregar Bloqueo
            </button>
          </div>

          {/* List of time blocks */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Bloqueos Activos</h2>

            {timeBlocks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay bloqueos de horario activos</p>
            ) : (
              <div className="space-y-3">
                {timeBlocks.map((block) => {
                  const startDate = parseISO(block.start_datetime)
                  const endDate = parseISO(block.end_datetime)
                  return (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(startDate, "EEEE d 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                            {block.reason && ` • ${block.reason}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTimeBlock(block.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
