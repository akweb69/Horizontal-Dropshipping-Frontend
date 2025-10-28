import axios from 'axios';
import { Loader } from 'lucide-react';
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const LavUttolon = () => {
    const [loading, setLoading] = React.useState(false);
    const [data, setData] = React.useState([]);
    const [orders, setOrders] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [totalbalance, setTotalBalance] = React.useState(0);
    const [totalwithdraw, setTotalWithdraw] = React.useState(0);

    const balance = totalbalance - totalwithdraw;

    // load data--->
    useEffect(() => {
        setLoading(true);
        // fecth orders data-->
        axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then(res => {
                const data = res.data || [];
                const successData = data.filter(item => item.status === 'Delivered');
                setTotalBalance(successData.reduce((acc, order) => acc + order.profit, 0));
                setOrders(successData);
                console.log(successData);

            })
            .catch(err => {
                setError("Something went wrong!");
            })
        // load withdraw data-->
        axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw_admin`)
            .then(res => {
                const data = res.data;
                setData(data);
                console.log(data);
                setTotalWithdraw(data.reduce((acc, order) => acc + order.amount, 0));
            })
            .catch(err => {
                setError("Something went wrong!");
            })

        setLoading(false);
    }, [])
    // handle withdraw btn--->
    const [amount, setAmount] = React.useState(0);
    const [description, setDescription] = React.useState("");
    const date = new Date().toLocaleDateString('bn-BD');

    const withdarwDetails = {
        amount: parseInt(amount),
        description,
        date
    }

    const handleWithdraw = (e) => {
        e.preventDefault()
        axios.post(`${import.meta.env.VITE_BASE_URL}/withdraw_admin`, withdarwDetails)
            .then(res => {
                Swal.fire({
                    icon: 'success',
                    title: 'Withdraw added successfully',
                    showConfirmButton: false,
                    timer: 1500
                })
                axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw_admin`)
                    .then(res => {
                        const data = res.data;
                        setData(data);
                    })
            })
            .catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to add withdraw',
                    showConfirmButton: false,
                    timer: 1500
                })
            })
    }

    // check loading --->
    if (loading) {
        return <div className="w-full flex items-center justify-center h-64">
            <div className=""> <Loader className="h-12 w-12 animate-spin text-primary"></Loader> </div>
        </div>
    }
    // final output-->
    return (
        <div className='w-full min-[50vh] bangla '>
            {/* amount card */}
            <div className="grid grid-cols-2 gap-4 items-center">
                <div className="p-4 flex w-full flex-col justify-center items-center gap-4 rounded-lg shadow-lg bg-white">
                    <div className="text-center text-xl md:text-2xl font-semibold">Total Balance</div>
                    <div className="text-2xl md:text-3xl font-semibold">{balance}</div>
                </div>
                <div className="p-4 flex w-full flex-col rounded-lg shadow-lg bg-white justify-center items-center gap-4">
                    <div className="text-center text-xl md:text-2xl font-semibold">Total Withdraw</div>
                    <div className="text-2xl md:text-3xl font-semibold">{totalwithdraw}</div>
                </div>
            </div>

            {/* form */}
            <form onSubmit={handleWithdraw}>
                <div className="mt-4 rounded-lg bg-orange-100 shadow-lg p-4 grid lg:grid-cols-10 gap-4">
                    <input className='w-full col-span-3 p-4 rounded-md  outline-dashed outline-orange-400' type="number" placeholder='Enter Withdraw Amount' required onChange={(e) => setAmount(e.target.value)} />

                    <input className='w-full col-span-5 outline-dashed outline-orange-400 p-4 rounded-md' type="text" placeholder='Enter Why Withdraw Balance' required onChange={(e) => setDescription(e.target.value)} />

                    <button type='submit' className='w-full col-span-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors '>Withdraw</button>

                </div>
            </form>
            {/* history of withdraw -- in table */}
            <div className="w-full mt-6 lg:mt-10 bg-white shadow-lg p-4 rounded-lg">

                {/* headline */}
                <h1 className="text-center text-xl md:text-2xl font-semibold bg-orange-200 p-4 rounded-lg">Withdraw History</h1>
                <div className="overflow-x-auto">
                    <table className="table w-full mt-4 border rounded-lg">
                        <thead className='border p-4'>
                            <tr >
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((item, index) => (
                                <tr className='hover:bg-orange-50 border' key={index}>
                                    <td>{item?.amount} Tk</td>
                                    <td>{item?.description}</td>
                                    <td>{item?.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


        </div >
    );
};

export default LavUttolon;