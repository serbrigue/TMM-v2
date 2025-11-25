import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

interface Review {
    id: number;
    cliente_nombre: string;
    calificacion: number;
    comentario: string;
    fecha: string;
}

interface ReviewSectionProps {
    courseId?: number;
    workshopId?: number;
    categoryId?: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ courseId, workshopId, categoryId }) => {
    const { isAuthenticated, user, isEnrolledInCourse, isEnrolledInWorkshop } = useAuth();

    const isEnrolled = courseId
        ? isEnrolledInCourse(courseId)
        : (workshopId ? isEnrolledInWorkshop(workshopId) : false);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchReviews = async () => {
        try {
            let url = 'http://localhost:8000/api/resenas/';
            // Priority: Category (for workshops) > Course ID
            if (categoryId) {
                url += `?interes=${categoryId}`;
            } else if (courseId) {
                url += `?curso=${courseId}`;
            } else if (workshopId) {
                // Fallback if no category provided, though we prefer category for workshops
                url += `?taller=${workshopId}`;
            }

            const response = await axios.get(url);
            setReviews(response.data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [courseId, workshopId, categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Por favor selecciona una calificación.');
            return;
        }
        if (!comment.trim()) {
            setError('Por favor escribe un comentario.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const data: any = {
                calificacion: rating,
                comentario: comment,
            };
            if (courseId) data.curso = courseId;
            if (workshopId) data.taller = workshopId;

            await axios.post('http://localhost:8000/api/resenas/', data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setComment('');
            setRating(0);
            fetchReviews(); // Refresh list
        } catch (err: any) {
            console.error('Error submitting review:', err);
            if (err.response?.status === 400) {
                // Validation error from backend (e.g., not enrolled)
                const msg = err.response.data[0] || "Error de validación.";
                setError(msg);
            } else if (err.response?.status === 403) {
                setError('No tienes permiso para dejar una reseña.');
            } else {
                setError('Error al enviar la reseña. Inténtalo de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Reseñas y Opiniones</h3>

            {/* Review List */}
            <div className="space-y-6 mb-10">
                {loading ? (
                    <p>Cargando reseñas...</p>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">{review.cliente_nombre}</span>
                                <span className="text-sm text-gray-500">{new Date(review.fecha).toLocaleDateString()}</span>
                            </div>
                            <div className="mb-2">
                                <StarRating rating={review.calificacion} readonly size="sm" />
                            </div>
                            <p className="text-gray-600">{review.comentario}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                )}
            </div>

            {/* Review Form */}
            {/* Review Form */}
            {isAuthenticated ? (
                isEnrolled ? (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h4 className="text-lg font-semibold mb-4">Deja tu opinión</h4>
                        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                                <StarRating rating={rating} onRatingChange={setRating} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comentario</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Cuéntanos qué te pareció..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Enviando...' : 'Publicar Reseña'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                        <p className="text-gray-600">
                            Solo los estudiantes inscritos pueden dejar una reseña.
                            {courseId ? ' ¡Inscríbete al curso para compartir tu experiencia!' : ' ¡Inscríbete al taller para compartir tu experiencia!'}
                        </p>
                    </div>
                )
            ) : (
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
                    Inicia sesión para dejar una reseña.
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
