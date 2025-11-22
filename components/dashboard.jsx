/////////React components to display in adminjs dashboard////////////


import React, { useState } from 'react'
import { Box, H2, H3, H4, H5, H6, Text, Button, Input } from '@adminjs/design-system'

let all = null
let t = null 

const Dashboard = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTableId, setSearchTableId] = useState('')

  

  // Fetch all tables
  const fetchAllTables = async () => {
    setLoading(true)
    try {
      const res = await fetch('/admin/api/myObject')
      const data = await res.json()
      data.length == 0 ? all = 1 : all = null 
      console.log("qqqqqqqqqqq", all)
      setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch specific table reservations
  const fetchTableReservations = async () => {
    if (!searchTableId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/api/myObject?tableID=${searchTableId}`)
      const data = await res.json()
      !data ? t = 1: t = null
      console.log("qqqqqqqqqqq", t)
      console.log("fetch response", data)
      setItems(data ? [data] : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cancelReservation = async (tableId, date, index) => {
    try {
      const res = await fetch(`/admin/api/cancelReservation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, date, index }),
      })
      fetchAllTables() // refresh after cancellation
      console.log('cancellation response', res)
    } catch (err) {
      console.error(err)
    }
  }
console.log("beforeeee", t)
  return (
    <Box variant="grey" p="xl">
      <H2>Dashboard Control</H2>

      <Box mb="lg" display="flex" gap="sm">
        <Input
          placeholder="Enter Table ID"
          value={searchTableId}
          onChange={(e) => setSearchTableId(e.target.value)}
        />
        <Button variant="success" onClick={fetchTableReservations}>
          Search Table Reservations
        </Button>
        <Button variant="primary" ml= "lg" onClick={fetchAllTables}>
          Load All Tables Reservations
        </Button>
      </Box>

      <Box mt="xl">
        {loading && <Text>Loading...</Text>}

        {items.length > 0 ? (
          <Box>
            {items.map((item, index) => (
              <Box
                key={item._id || index}
                border="default"
                p="md"
                mb="lg"
                borderRadius="10px"
                bg="white"
                boxShadow="card"
              >
                <H3>
                  <b>Table ID:</b> {item.tableId}
                </H3>
                <Text fontSize="md" mb="sm">
                  <b>Range:</b> {item.available_range}
                </Text>

                {item.reserve?.length > 0 ? (
                  item.reserve.map((resObj, dateIndex) => (
                    <Box
                      key={dateIndex}
                      border="default"
                      borderRadius="8px"
                      p="md"
                      mb="md"
                      bg="#f9f9f9"
                    >
                      <H4 mb="sm"><b>Date:</b> {resObj.reserve_date}</H4>

                      {resObj.reserve_array?.length > 0 ? (
                        <Box
                          display="grid"
                          gridTemplateColumns="120px 120px 80px 1fr 200px 140px"
                          gap="sm"
                          borderTop="default"
                          pt="sm"
                        >
                          <Text fontWeight="bold">Start Time</Text>
                          <Text fontWeight="bold">End Time</Text>
                          <Text fontWeight="bold">People</Text>
                          <Text fontWeight="bold">Items</Text>
                          <Text fontWeight="bold">Email</Text>
                          <Text fontWeight="bold">Actions</Text>

                          {resObj.reserve_array.map((r, i) => (
                            <React.Fragment key={i}>
                              <Text borderBottom="default" pb="sm">{r[0]}</Text>
                              <Text borderBottom="default" pb="sm">{r[1]}</Text>
                              <Text borderBottom="default" pb="sm">{r[2]}</Text>
                              <Text borderBottom="default" pb="sm">{Array.isArray(r[3]) ? r[3].join(', ') : r[3]}</Text>
                              <Text borderBottom="default" pb="sm">{r[4]}</Text>
                              <Box borderBottom="default" pb="sm">
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => cancelReservation(item.tableId, r[0], r[1])}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </React.Fragment>
                          ))}
                        </Box>
                      ) : (
                        <Text>No reservations for this date.</Text>
                      )}
                    </Box>
                  ))
                ) : (
                  <Text>No reservations yet.</Text>
                )}
              </Box>
            ))}
          </Box>
        ) : !loading && t ?(
        <Text>Invalid table id.</Text>
        ) : !loading && all ?(
        <Text>Sorry but there are no tables you have created.</Text>
        ) :( !loading &&
        <Text>What is on your mind!</Text>
        )
      }
      </Box>
    </Box>
  )
}

export default Dashboard



// return (
//   <Box variant="grey" p="xl">
//     <H2>Loaded Items</H2>

//     <Button variant="primary" onClick={fetchData} mb="lg">
//       Load Items
//     </Button>

//     <Box mt="xl">
//       {loading && <Text>Loading...</Text>}

//       {items.length > 0 ? (
//         <Box>
//           {items.map((item, index) => (
//             <Box
//               key={item._id || index}
//               border="default"
//               p="md"
//               mb="lg"
//               borderRadius="10px"
//               bg="white"
//               boxShadow="card"
//             >
//               <H3><b>Table ID:</b> {item.tableId}</H3>
//               <H5><b>Range:</b> {item.available_range}</H5>

//               {item.reserve && item.reserve.length > 0 ? (
//                 item.reserve.map((resObj, dateIndex) => (
//                   <Box
//                     key={dateIndex}
//                     border="default"
//                     borderRadius="8px"
//                     p="md"
//                     mb="md"
//                     bg="#f9f9f9"
//                   >
//                     <H3 mb="sm">Reservation Date: {resObj.reserve_date}</H3>

//                     {resObj.reserve_array?.length > 0 ? (
//                       <Box display="grid" gridTemplateColumns="120px 120px 80px 1fr 200px" gap="sm" borderTop="default" pt="sm">
//                         {/* Header row */}
//                         <Text fontWeight="bold">Start Time</Text>
//                         <Text fontWeight="bold">End Time</Text>
//                         <Text fontWeight="bold">People</Text>
//                         <Text fontWeight="bold">Items</Text>
//                         <Text fontWeight="bold">Email</Text>

//                         {/* Data rows */}
//                         {resObj.reserve_array.map((r, i) => (
//                           <React.Fragment key={i}>
//                             <Text borderBottom="default" pb="sm">{r[0]}</Text>
//                             <Text borderBottom="default" pb="sm">{r[1]}</Text>
//                             <Text borderBottom="default" pb="sm">{r[2]}</Text>
//                             <Text borderBottom="default" pb="sm">{Array.isArray(r[3]) ? r[3].join(", ") : r[3]}</Text>
//                             <Text borderBottom="default" pb="sm">{r[4]}</Text>
//                           </React.Fragment>
//                         ))}
//                       </Box>
//                     ) : (
//                       <Text>No reservations for this date.</Text>
//                     )}
//                   </Box>
//                 ))
//               ) : (
//                 <Text>No reservations yet.</Text>
//               )}
//             </Box>
//           ))}
//         </Box>
//       ) : (
//         !loading && <Text>No items loaded yet.</Text>
//       )}
//     </Box>
//   </Box>
// )
