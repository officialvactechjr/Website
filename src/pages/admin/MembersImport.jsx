import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import PageHeader from '../../components/layout/PageHeader'
import BulkImport from '../../features/members/components/BulkImport'
import TempPassword from '../../features/members/components/TempPassword'

export default function MembersImport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [handover, setHandover] = useState(null)

  return (
    <>
      <PageHeader
        title="Add many members"
        description="Import a spreadsheet of members. Check the preview, then hand out each temporary password in person."
      />

      <div className="max-w-3xl">
        <BulkImport
          onDone={(result) => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            setHandover(result)
          }}
          onCancel={() => navigate('/admin/members')}
        />
      </div>

      {handover && <TempPassword result={handover} onClose={() => setHandover(null)} />}
    </>
  )
}
