"""
Script para verificar se todas as dependências estão instaladas corretamente
"""
import sys

def check_package(package_name, import_name=None):
    """Verifica se um pacote está instalado"""
    if import_name is None:
        import_name = package_name
    
    try:
        module = __import__(import_name)
        version = getattr(module, '__version__', 'instalado')
        print(f"✓ {package_name:<20} {version}")
        return True
    except ImportError:
        print(f"✗ {package_name:<20} NÃO INSTALADO")
        return False

def main():
    print("\n" + "="*60)
    print("🔍 VERIFICANDO DEPENDÊNCIAS DO BACKEND")
    print("="*60 + "\n")
    
    packages = [
        ("FastAPI", "fastapi"),
        ("Uvicorn", "uvicorn"),
        ("SQLAlchemy", "sqlalchemy"),
        ("Alembic", "alembic"),
        ("Pydantic", "pydantic"),
        ("Python-JOSE", "jose"),
        ("Passlib", "passlib"),
        ("Python-Multipart", "multipart"),
        ("Python-Dotenv", "dotenv"),
        ("Python-Dateutil", "dateutil"),
    ]
    
    all_installed = True
    
    for package_name, import_name in packages:
        if not check_package(package_name, import_name):
            all_installed = False
    
    print("\n" + "="*60)
    
    if all_installed:
        print("✅ TODAS AS DEPENDÊNCIAS ESTÃO INSTALADAS!")
        print("\n🎯 Próximo passo: Criar os modelos do banco de dados")
    else:
        print("❌ ALGUMAS DEPENDÊNCIAS NÃO ESTÃO INSTALADAS!")
        print("\n🔧 Execute: pip install -r requirements.txt")
    
    print("="*60 + "\n")
    
    return 0 if all_installed else 1

if __name__ == "__main__":
    sys.exit(main())

