import { useEffect, useState } from 'react';
import ReactTable from 'react-table-v6'
import 'react-table-v6/react-table.css'
import { useQuery } from 'urql';

function History(props) {
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
      result.data.historyEntities.forEach(data => {
        data.amount = Number(data.amount / (10 ** 18));
        data.time = (new Date(data.time * 1000)).toUTCString()
      })
      setData(result.data.historyEntities.reverse())
    }
  }
  useEffect(() => {
    getHistory()
  }, [result.data])
  return (
    <div >
      <h3>History of Account</h3>
      <ReactTable
        data={data}
        columns={columns}
        defaultPageSize={5}
      />
    </div>
  )
}

export default History
