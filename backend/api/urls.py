from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicCursoView, PublicCursoDetailView, 
    PublicTallerView, PublicTallerDetailView,
    PublicPostView, PublicPostDetailView,
    RegisterView, UserProfileView, MyTokenObtainPairView,
    AdminDashboardView, AdminRevenueView, AdminClienteDetailView,
    EnrollmentView, UserEnrollmentsView, BulkEmailView, ContactView, CalendarView,
    AdminTallerViewSet, AdminClienteViewSet, AdminCursoViewSet, 
    AdminPostViewSet, AdminContactoViewSet, AdminInteresViewSet,
    ResenaViewSet, NewsletterViewSet, InteraccionViewSet, TransaccionViewSet,
    CancelEnrollmentView
)

router = DefaultRouter()
router.register(r'admin/talleres', AdminTallerViewSet)
router.register(r'admin/clientes', AdminClienteViewSet)
router.register(r'admin/cursos', AdminCursoViewSet)
router.register(r'admin/posts', AdminPostViewSet)
router.register(r'admin/mensajes', AdminContactoViewSet)
router.register(r'admin/intereses', AdminInteresViewSet)
router.register(r'admin/interacciones', InteraccionViewSet)
router.register(r'admin/transacciones', TransaccionViewSet)
router.register(r'resenas', ResenaViewSet)
router.register(r'newsletter', NewsletterViewSet, basename='newsletter')

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Public
    path('public/cursos/', PublicCursoView.as_view(), name='public_cursos'),
    path('public/cursos/<int:pk>/', PublicCursoDetailView.as_view(), name='public_curso_detail'),
    path('public/talleres/', PublicTallerView.as_view(), name='public_talleres'),
    path('public/talleres/<int:pk>/', PublicTallerDetailView.as_view(), name='public_taller_detail'),
    path('public/posts/', PublicPostView.as_view(), name='public_posts'),
    path('public/posts/<int:pk>/', PublicPostDetailView.as_view(), name='public_post_detail'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('calendar/events/', CalendarView.as_view(), name='calendar_events'),
    
    # User Actions
    path('enroll/', EnrollmentView.as_view(), name='enroll'),
    path('enroll/cancel/', CancelEnrollmentView.as_view(), name='cancel_enrollment'),
    path('my-enrollments/', UserEnrollmentsView.as_view(), name='my_enrollments'),
    
    # Admin Custom Views
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/revenue/', AdminRevenueView.as_view(), name='admin_revenue'),
    path('admin/send-bulk-email/', BulkEmailView.as_view(), name='send_bulk_email'),
    path('admin/clientes/<int:pk>/', AdminClienteDetailView.as_view(), name='admin_cliente_detail'),
    
    # Router
    path('', include(router.urls)),
]
