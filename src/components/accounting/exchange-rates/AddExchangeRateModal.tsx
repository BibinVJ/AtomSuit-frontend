"use client";

import { useState, useEffect } from 'react';
import { Modal } from '../../ui/modal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { addExchangeRate } from '../../../services/ExchangeRateService';
import { getCurrencies } from '../../../services/CurrencyService';
import { Currency } from '../../../types/Currency';
import { isApiError } from '../../../utils/errors';
import Select from '../../form/Select';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddExchangeRateModal({ isOpen, onClose, onSuccess }: Props) {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [formData, setFormData] = useState({
        base_currency_id: 0,
        target_currency_id: 0,
        rate: 0,
        effective_date: new Date().toISOString().split('T')[0],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            fetchCurrencies();
        }
    }, [isOpen]);

    const fetchCurrencies = async () => {
        try {
            const resp = await getCurrencies({ unpaginated: true });
            setCurrencies(resp.data);
            // Auto-select first and second currency if available
            if (resp.data.length >= 2) {
                setFormData(prev => ({
                    ...prev,
                    base_currency_id: resp.data[0].id,
                    target_currency_id: resp.data[1].id
                }));
            }
        } catch (error) {
            console.error('Error fetching currencies:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            base_currency_id: currencies[0]?.id || 0,
            target_currency_id: currencies[1]?.id || 0,
            rate: 0,
            effective_date: new Date().toISOString().split('T')[0],
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.base_currency_id || !formData.target_currency_id || !formData.rate) {
            toast.error('Base currency, target currency, and rate are required');
            return;
        }

        try {
            await addExchangeRate(formData);
            onSuccess();
            toast.success('Exchange rate added successfully');
            handleClose();
        } catch (error: unknown) {
            if (isApiError(error) && error.response?.status === 422) {
                const apiErrors = error.response.data.errors;
                setErrors(Object.keys(apiErrors).reduce((acc, key) => {
                    acc[key] = apiErrors[key][0];
                    return acc;
                }, {} as Record<string, string>));
                toast.error('Please correct the errors in the form');
            } else {
                console.error('Error adding exchange rate:', error);
                toast.error('Failed to add exchange rate');
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] p-6 md:p-10">
            <div className="relative w-full">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Add New Exchange Rate
                    </h4>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                        Fill in the details to add a new exchange rate.
                    </p>
                </div>
                <form className="flex flex-col" onSubmit={handleSubmit}>
                    <div className="px-2 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                            <div>
                                <Label>Base Currency <span className="text-red-500">*</span></Label>
                                <Select
                                    options={currencies.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))}
                                    value={formData.base_currency_id}
                                    onChange={(val) => setFormData({ ...formData, base_currency_id: Number(val) })}
                                />
                                {errors.base_currency_id && <p className="mt-1 text-xs text-red-500">{errors.base_currency_id}</p>}
                            </div>

                            <div>
                                <Label>Target Currency <span className="text-red-500">*</span></Label>
                                <Select
                                    options={currencies.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))}
                                    value={formData.target_currency_id}
                                    onChange={(val) => setFormData({ ...formData, target_currency_id: Number(val) })}
                                />
                                {errors.target_currency_id && <p className="mt-1 text-xs text-red-500">{errors.target_currency_id}</p>}
                            </div>

                            <div>
                                <Label>Rate <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    step="0.000001"
                                    placeholder="e.g. 1.25"
                                    value={formData.rate}
                                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                                    error={!!errors.rate}
                                    hint={errors.rate}
                                />
                            </div>

                            <div>
                                <Label>Effective Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={formData.effective_date}
                                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                                    error={!!errors.effective_date}
                                    hint={errors.effective_date}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Close
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
