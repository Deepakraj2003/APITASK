import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import './App.css';

// Importing Recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const columns = [
  { id: 'ID', label: 'ID' },
  { id: 'Title', label: 'Title' },
  { id: 'Description', label: 'Description' },
  { id: 'Price', label: 'Price' },
  { id: 'Category', label: 'Category' },
  { id: 'Sold', label: 'Sold' },
  { id: 'Image', label: 'Image' },
];

function createData(id, title, description, price, category, sold, image, dateOfSale) {
  return {
    ID: id,
    Title: title,
    Description: description,
    Price: price,
    Category: category,
    Sold: sold ? 'Sold' : 'Unsold',
    Image: image,
    DateOfSale: new Date(dateOfSale), // Convert date string to Date object
  };
}

const months = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];

export default function StickyHeadTable() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchId, setSearchId] = useState('');
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [totalNotSoldItems, setTotalNotSoldItems] = useState(0);
  const [priceRangeData, setPriceRangeData] = useState([]);

  const getData = () => {
    fetch(`http://localhost:4000/getmany`, {
      method: 'GET',
      headers: { 'backend-token': localStorage['storetoken'] },
    })
      .then((data) => data.json())
      .then((data) => {
        const formattedData = data.map((item) =>
          createData(item.id, item.title, item.description, item.price, item.category, item.sold, item.image, item.dateOfSale)
        );
        setRows(formattedData);
        setFilteredRows(formattedData); 
        calculateTotals(formattedData);
        calculatePriceRangeData(formattedData, selectedMonth);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const calculateTotals = (data) => {
    const totalAmount = data.reduce((total, item) => total + item.Price, 0);
    const soldItems = data.filter((item) => item.Sold === 'Sold').length;
    const notSoldItems = data.filter((item) => item.Sold === 'Unsold').length;
    setTotalSaleAmount(totalAmount);
    setTotalSoldItems(soldItems);
    setTotalNotSoldItems(notSoldItems);
  };

  const calculatePriceRangeData = (data, month) => {
    // Example price ranges; adjust as per your requirements
    const priceRanges = [
      { name: '0-100', count: 0 },
      { name: '101-200', count: 0 },
      { name: '201-300', count: 0 },
      { name: '301-400', count: 0 },
      { name: '401-500', count: 0 },
    ];

    data.forEach((item) => {
      if (item.DateOfSale.getMonth() === month) {
        const price = item.Price;
        if (price >= 0 && price <= 100) priceRanges[0].count++;
        else if (price >= 101 && price <= 200) priceRanges[1].count++;
        else if (price >= 201 && price <= 300) priceRanges[2].count++;
        else if (price >= 301 && price <= 400) priceRanges[3].count++;
        else if (price >= 401 && price <= 500) priceRanges[4].count++;
      }
    });

    setPriceRangeData(priceRanges);
  };

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    filterRows(searchId, month);
  };

  const handleSearchIdChange = (event) => {
    const id = event.target.value;
    setSearchId(id);
    filterRows(id, selectedMonth);
  };

  const filterRows = (id, month) => {
    let filtered = rows;
    if (id) {
      filtered = filtered.filter((row) => row.ID.toString().includes(id));
    }
    if (month !== '') {
      filtered = filtered.filter((row) => row.DateOfSale.getMonth() === month);
    }
    setFilteredRows(filtered);
    calculateTotals(filtered);
    calculatePriceRangeData(filtered, month);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
    <div className="search-container">
        <Input
          placeholder="Search by ID"
          value={searchId}
          onChange={handleSearchIdChange}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
        <Select
          value={selectedMonth}
          onChange={handleMonthChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Select Month' }}
          className="month-select"
        >
          <MenuItem value="">
            <em>All Months</em>
          </MenuItem>
          {months.map((month) => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </Select>
      </div>
    <Paper className="root">
      <TableContainer className="table-container">
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="left"
                  className="table-header-cell"
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.ID} className="table-row">
                  {columns.map((column) => (
                    <TableCell key={column.id} align="left" className="table-cell">
                      {column.id === 'Image' ? (
                        <img src={row[column.id]} alt={row.Title} className="table-image" />
                      ) : (
                        row[column.id]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        className="table-pagination"
      />
      </Paper>
      
      <div className="summary-container">
        <div className="summary-item">
          <h3>Total Sale Amount</h3>
          <p>{totalSaleAmount}</p>
        </div>
        <div className="summary-item">
          <h3>Total Sold Items</h3>
          <p>{totalSoldItems}</p>
        </div>
        <div className="summary-item">
          <h3>Total Not Sold Items</h3>
          <p>{totalNotSoldItems}</p>
        </div>
      </div>

      <div className="chart-container">
        <h2>Price Range Chart</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={priceRangeData}
            margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      

      </>
   
  );
}
