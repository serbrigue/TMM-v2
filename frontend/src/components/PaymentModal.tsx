import { useState } from 'react';
import { Upload, CheckCircle, Copy, CreditCard, Landmark } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from './ui/Modal';
import client from '../api/client';
import { bankDetails } from '../config/bankDetails';
import { useNavigate } from 'react-router-dom';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<any>;
    amount: number;
    itemName: string;
    enrollmentId: number | null;
    itemType: 'curso' | 'taller' | 'order';
    orderId?: number | null;
    onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, amount, itemName, enrollmentId, itemType, orderId, onSuccess }) => {
    const [step, setStep] = useState<'selection' | 'bank_details' | 'mp_redirect' | 'upload' | 'success'>('selection');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSelection = async (method: 'mercadopago' | 'transfer' | 'upload_direct') => {
        if (!enrollmentId && !orderId) {
            await onConfirm();
        }

        if (method === 'mercadopago') {
            setStep('mp_redirect');
            window.open('https://link.mercadopago.cl/tumarca', '_blank');
        } else if (method === 'upload_direct') {
            setStep('upload');
        } else {
            setStep('bank_details');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('comprobante', file);
            formData.append('monto', amount.toString());

            if (orderId) {
                formData.append('orden_id', orderId.toString());
            } else {
                let currentEnrollmentId = enrollmentId;
                if (!currentEnrollmentId) {
                    try {
                        const result = await onConfirm();
                        if (result) {
                            currentEnrollmentId = result as unknown as number;
                        }
                    } catch (e) {
                        console.error("Error creating enrollment before upload", e);
                        setUploading(false);
                        return;
                    }
                }
                if (!currentEnrollmentId) {
                    console.error("Enrollment ID missing after attempt");
                    alert("Error: No se pudo crear la inscripción. Por favor intenta nuevamente.");
                    setUploading(false);
                    return;
                }
                formData.append('inscripcion_id', currentEnrollmentId.toString());
            }

            await client.post('/admin/transacciones/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploading(false);
            setStep('success');
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Error uploading receipt", error);
            setUploading(false);
            alert("Error al subir el comprobante. Por favor inténtalo nuevamente.");
        }
    };

    const resetModal = () => {
        setStep('selection');
        setFile(null);
        onClose();
    };

    const goToProfile = () => {
        onClose();
        navigate('/profile?tab=payments');
    };

    return (
        <Modal open={isOpen} onOpenChange={(open) => !open && resetModal()}>
            <ModalContent className="max-w-lg bg-white">
                <ModalHeader>
                    <ModalTitle className="text-2xl font-bold text-center mb-2">
                        {step === 'selection' && 'Elige tu método de pago'}
                        {step === 'bank_details' && 'Datos de Transferencia'}
                        {step === 'mp_redirect' && 'Pago con MercadoPago'}
                        {step === 'upload' && 'Subir Comprobante'}
                        {step === 'success' && '¡Comprobante Recibido!'}
                    </ModalTitle>
                    <ModalDescription className="text-center">
                        {step === 'selection' && `Para inscribirte en ${itemName}, selecciona cómo deseas pagar.`}
                        {step === 'bank_details' && 'Realiza la transferencia a los siguientes datos:'}
                        {step === 'mp_redirect' && 'Se ha abierto una nueva pestaña para pagar.'}
                    </ModalDescription>
                </ModalHeader>

                <div className="p-4">
                    {step === 'selection' && (
                        <div className="space-y-4">
                            <Button
                                onClick={() => handleSelection('mercadopago')}
                                className="w-full py-6 text-lg flex items-center justify-center gap-3 bg-[#009EE3] hover:bg-[#008ED6] text-white border-transparent"
                            >
                                <CreditCard className="w-6 h-6" />
                                Pagar con Mercado Pago
                            </Button>
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">O</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <Button
                                onClick={() => handleSelection('transfer')}
                                variant="outline"
                                className="w-full py-6 text-lg flex items-center justify-center gap-3 border-2"
                            >
                                <Landmark className="w-6 h-6" />
                                Transferencia Bancaria
                            </Button>

                            <button
                                onClick={() => handleSelection('upload_direct')}
                                className="w-full text-center text-sm text-tmm-pink hover:underline mt-4"
                            >
                                Ya hice el pago, quiero subir el comprobante
                            </button>
                        </div>
                    )}

                    {step === 'bank_details' && (
                        <>
                            <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Monto a pagar</span>
                                    <span className="text-xl font-bold text-tmm-black">${amount.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="h-px bg-gray-200"></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Datos Bancarios</p>
                                    <div className="space-y-2 text-sm text-tmm-black">
                                        <div className="flex justify-between">
                                            <span>Banco:</span>
                                            <span className="font-medium">{bankDetails.bankName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tipo de Cuenta:</span>
                                            <span className="font-medium">{bankDetails.accountType}</span>
                                        </div>
                                        <div className="flex justify-between group cursor-pointer" onClick={() => handleCopy(bankDetails.accountNumber)}>
                                            <span>N° Cuenta:</span>
                                            <span className="font-medium flex items-center gap-1">
                                                {bankDetails.accountNumber} <Copy className="w-3 h-3 text-gray-400 group-hover:text-tmm-pink" />
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Nombre:</span>
                                            <span className="font-medium">{bankDetails.accountName}</span>
                                        </div>
                                        <div className="flex justify-between group cursor-pointer" onClick={() => handleCopy(bankDetails.email)}>
                                            <span>Email:</span>
                                            <span className="font-medium flex items-center gap-1">
                                                {bankDetails.email} <Copy className="w-3 h-3 text-gray-400 group-hover:text-tmm-pink" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => setStep('upload')}
                                    className="w-full py-4 shadow-lg shadow-tmm-pink/20"
                                >
                                    Subir Comprobante Ahora
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={goToProfile}
                                    className="w-full text-sm text-gray-500"
                                >
                                    Pagar después (Ir a mi Perfil)
                                </Button>
                            </div>
                        </>
                    )}

                    {step === 'mp_redirect' && (
                        <div className="text-center space-y-6 py-4">
                            <p className="text-gray-600">
                                Hemos abierto la página de pago en una nueva pestaña.
                                <br />
                                Una vez completes el pago, regresa aquí.
                            </p>
                            <Button
                                onClick={goToProfile}
                                className="w-full py-4"
                            >
                                Ir a mi Perfil
                            </Button>
                            <button
                                onClick={() => window.open('https://link.mercadopago.cl/tumarca', '_blank')}
                                className="text-sm text-tmm-pink hover:underline"
                            >
                                ¿No se abrió? Haz clic aquí
                            </button>
                        </div>
                    )}

                    {step === 'upload' && (
                        <div className="text-center">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 hover:border-tmm-pink transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    {file ? (
                                        <div className="text-sm font-medium text-tmm-pink">
                                            {file.name}
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-gray-700">Haz clic para subir imagen o PDF</p>
                                            <p className="text-xs text-gray-400">Máximo 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="w-full py-4"
                            >
                                {uploading ? 'Subiendo...' : 'Enviar Comprobante'}
                            </Button>

                            <button
                                onClick={() => setStep('bank_details')}
                                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                            >
                                Volver a datos bancarios
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-tmm-green/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircle className="w-10 h-10 text-tmm-green" />
                            </div>
                            <p className="text-tmm-black/70 mb-8">
                                Hemos recibido tu comprobante. Tu acceso será habilitado en breve una vez verifiquemos el pago.
                            </p>
                            <Button
                                onClick={goToProfile}
                                className="w-full"
                            >
                                Ir a Mis Cursos
                            </Button>
                        </div>
                    )}
                </div>
            </ModalContent>
        </Modal>
    );
};

export default PaymentModal;
