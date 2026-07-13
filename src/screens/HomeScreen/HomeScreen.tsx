import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchProducts,
  selectProduct,
  setSearchQuery,
  setSelectedCategory,
} from '../../store/slices/productsSlice';
import { RootStackParamList } from '../../navigation/types';
import { Product } from '../../types/product.types';
import { ProductCard } from './components/ProductCard';
import { colors } from '../../constants/colors';
import { AppIcon } from '../../components/AppIcon/AppIcon';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [searchVisible, setSearchVisible] = useState(false);
  const { items, loading, error, searchQuery, selectedCategory } = useAppSelector(
    state => state.products,
  );
  const categories = ['Todos', ...Array.from(new Set(items.map(item => item.category)))];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter(item => {
    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesQuery =
      !normalizedQuery ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleOpenProduct = (product: Product) => {
    dispatch(selectProduct(product));
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleToggleSearch = () => {
    if (searchVisible) {
      dispatch(setSearchQuery(''));
    }

    setSearchVisible(current => !current);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Tienda</Text>
              <Text style={styles.subtitle}>Explora el catalogo y compra en minutos.</Text>
            </View>
            <View style={styles.headerActions}>
              {searchVisible ? (
                <View style={styles.searchInline}>
                  <Pressable onPress={handleToggleSearch} style={styles.searchActionButton}>
                    <AppIcon color={colors.textMuted} name="search" size={18} />
                  </Pressable>
                  <TextInput
                    autoFocus
                    onChangeText={value => dispatch(setSearchQuery(value))}
                    placeholder="Buscar productos"
                    placeholderTextColor={colors.textMuted}
                    style={styles.searchInput}
                    value={searchQuery}
                  />
                </View>
              ) : (
                <Pressable onPress={handleToggleSearch} style={styles.iconButton}>
                  <AppIcon color={colors.textMuted} name="search" size={18} />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.stateText}>Cargando productos...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.centerState}>
            <Text style={styles.errorTitle}>No pudimos cargar el catalogo</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={() => dispatch(fetchProducts())} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error ? (
          <FlatList
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <ScrollView
                  contentContainerStyle={styles.chipsContent}
                  horizontal
                  showsHorizontalScrollIndicator={false}>
                  {categories.map(item => (
                    <Pressable
                      key={item}
                      onPress={() => dispatch(setSelectedCategory(item))}
                      style={[
                        styles.chip,
                        selectedCategory === item ? styles.activeChip : styles.inactiveChip,
                      ]}>
                      <Text
                        style={[
                          styles.chipText,
                          selectedCategory === item ? styles.activeChipText : undefined,
                        ]}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                {!filteredItems.length ? (
                  <View style={styles.emptyResults}>
                    <Text style={styles.stateText}>
                      No encontramos productos con esos filtros.
                    </Text>
                  </View>
                ) : null}
              </View>
            }
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.listContent}
            data={filteredItems}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={({ item }) => <ProductCard onPress={handleOpenProduct} product={item} />}
            showsVerticalScrollIndicator={false}
          />
        ) : null}

        {!loading && !error ? (
          <View style={styles.bottomNav}>
            <View style={[styles.bottomNavItem, styles.bottomNavItemActive]}>
              <AppIcon color={colors.primary} name="storefront" size={18} />
              <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Tienda</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Orders')} style={styles.bottomNavItem}>
              <AppIcon color={colors.textMuted} name="receipt_long" size={18} />
              <Text style={styles.bottomNavText}>Ordenes</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(8),
  },
  header: {
    paddingBottom: verticalScale(12),
    paddingTop: verticalScale(8),
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    paddingRight: scale(12),
  },
  headerActions: {
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'flex-end',
    minWidth: scale(40),
  },
  searchInline: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    borderRadius: scale(999),
    borderWidth: 1,
    flexDirection: 'row',
    height: scale(40),
    paddingLeft: scale(4),
    paddingRight: scale(12),
    width: scale(180),
  },
  searchActionButton: {
    alignItems: 'center',
    borderRadius: scale(999),
    height: scale(32),
    justifyContent: 'center',
    width: scale(32),
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLowest,
    borderRadius: scale(999),
    height: scale(40),
    justifyContent: 'center',
    width: scale(40),
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: moderateScale(14),
    paddingVertical: 0,
  },
  title: {
    color: colors.primary,
    fontSize: moderateScale(24),
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    marginTop: verticalScale(6),
  },
  listHeader: {
    paddingBottom: verticalScale(14),
  },
  chipsContent: {
    gap: scale(8),
    paddingVertical: verticalScale(8),
  },
  chip: {
    borderRadius: scale(12),
    height: verticalScale(32),
    justifyContent: 'center',
    paddingHorizontal: scale(14),
  },
  activeChip: {
    backgroundColor: colors.primarySoft,
  },
  inactiveChip: {
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  activeChipText: {
    color: colors.white,
  },
  emptyResults: {
    paddingTop: verticalScale(12),
  },
  listContent: {
    paddingBottom: verticalScale(100),
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  stateText: {
    color: colors.textMuted,
    fontSize: moderateScale(15),
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.text,
    fontSize: moderateScale(20),
    fontWeight: '800',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: scale(14),
    marginTop: verticalScale(16),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(12),
  },
  retryText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  bottomNav: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: -scale(16),
    paddingBottom: verticalScale(12),
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(10),
    position: 'absolute',
    right: -scale(16),
  },
  bottomNavItem: {
    alignItems: 'center',
    borderRadius: scale(999),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(6),
  },
  bottomNavItemActive: {
    backgroundColor: colors.accentSoft,
  },
  bottomNavText: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginTop: verticalScale(3),
  },
  bottomNavTextActive: {
    color: colors.primary,
  },
});
