import { useEffect, useState } from 'react';
import ReactTable from 'react-table-v6'
import 'react-table-v6/react-table.css'
import { useQuery } from 'urql';

function TableHistory(props) {
  const { account } = props
  const [data, setData] = useState([])
  const columns = [{
    Header: 'Action',
    accessor: 'event'
  }, {
    Header: 'Amount',
    accessor: 'amount',
  }, {
    Header: 'Time',
    accessor: 'time'
  },];
  const historyQuery = `
  query ($user: Bytes!){
    historyEntities(
      orderBy:time,
      where:{
      user: $user
    }) {
      id
      user
      amount
      time
      event
    }
  }
`;
  const [result] = useQuery({
    query: historyQuery,
    variables: { user: account }
  });

  const getHistory = () => {
    if (result.data !== undefined) {
      const data = result.data.historyEntities.map(data => ({
        event: data.event,
        amount: Number(data.amount / (10 ** 18)),
        time: (new Date(data.time * 1000)).toUTCString()
      })).reverse()
      console.log(data)
      setData(result.data.historyEntities.reverse())
      // setData()
    }
  }
  useEffect(() => {
    getHistory()
  })
  return (
    <div>

      <ReactTable
        data={data}
        columns={columns}
        defaultPageSize={5}
      />
    </div>
  )
}

export default TableHistory
