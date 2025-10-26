import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'

interface Meal {
  id: string
  type: '아침' | '점심' | '저녁' | '간식'
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
}

const MEAL_TYPES = [
  { id: '아침', name: '아침', icon: '🌅', color: '#f093fb' },
  { id: '점심', name: '점심', icon: '☀️', color: '#fbc531' },
  { id: '저녁', name: '저녁', icon: '🌙', color: '#667eea' },
  { id: '간식', name: '간식', icon: '🍪', color: '#30cfd0' }
]

export default function MealScreen() {
  const navigation = useNavigation()
  const [meals, setMeals] = useState<Meal[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMeal, setNewMeal] = useState({
    type: '아침' as '아침' | '점심' | '저녁' | '간식',
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  })

  // 목표 및 현재 섭취량
  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67
  }

  const todayTotal = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const handleAddMeal = () => {
    if (!newMeal.name.trim()) {
      Alert.alert('오류', '음식 이름을 입력해주세요.')
      return
    }

    const meal: Meal = {
      id: Date.now().toString(),
      type: newMeal.type,
      name: newMeal.name,
      calories: parseInt(newMeal.calories) || 0,
      protein: parseInt(newMeal.protein) || 0,
      carbs: parseInt(newMeal.carbs) || 0,
      fat: parseInt(newMeal.fat) || 0,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }

    setMeals([...meals, meal])
    setNewMeal({
      type: '아침',
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    })
    setShowAddModal(false)
    Alert.alert('성공', '식단이 추가되었습니다!')
  }

  const handleDeleteMeal = (id: string) => {
    Alert.alert(
      '식단 삭제',
      '이 식사 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => setMeals(meals.filter(m => m.id !== id))
        }
      ]
    )
  }

  const ProgressBar = ({ current, goal, color }: { current: number; goal: number; color: string }) => {
    const percentage = Math.min((current / goal) * 100, 100)
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { backgroundColor: color, width: `${percentage}%` }]} />
      </View>
    )
  }

  return (
    <LinearGradient colors={['#30cfd0', '#330867']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>식단 관리</Text>
          <Text style={styles.headerSubtitle}>오늘의 영양소 기록</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 오늘의 칼로리 */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <Text style={styles.calorieTitle}>오늘의 칼로리</Text>
            <Text style={styles.calorieDate}>{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.calorieMain}>
            <View style={styles.calorieCircle}>
              <Text style={styles.calorieValue}>{todayTotal.calories}</Text>
              <Text style={styles.calorieLabel}>kcal</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.calorieGoal}>목표: {dailyGoals.calories} kcal</Text>
              <ProgressBar current={todayTotal.calories} goal={dailyGoals.calories} color="#10b981" />
              <Text style={styles.calorieRemaining}>
                {Math.max(0, dailyGoals.calories - todayTotal.calories)} kcal 남음
              </Text>
            </View>
          </View>
        </View>

        {/* 영양소 분석 */}
        <View style={styles.nutrientCard}>
          <Text style={styles.nutrientTitle}>영양소 분석</Text>
          <View style={styles.nutrientGrid}>
            {/* 단백질 */}
            <View style={styles.nutrientItem}>
              <View style={[styles.nutrientIcon, { backgroundColor: '#667eea' }]}>
                <Text style={styles.nutrientIconText}>💪</Text>
              </View>
              <Text style={styles.nutrientName}>단백질</Text>
              <Text style={styles.nutrientValue}>{todayTotal.protein}g</Text>
              <Text style={styles.nutrientGoal}>목표: {dailyGoals.protein}g</Text>
              <ProgressBar current={todayTotal.protein} goal={dailyGoals.protein} color="#667eea" />
            </View>

            {/* 탄수화물 */}
            <View style={styles.nutrientItem}>
              <View style={[styles.nutrientIcon, { backgroundColor: '#fbc531' }]}>
                <Text style={styles.nutrientIconText}>🍚</Text>
              </View>
              <Text style={styles.nutrientName}>탄수화물</Text>
              <Text style={styles.nutrientValue}>{todayTotal.carbs}g</Text>
              <Text style={styles.nutrientGoal}>목표: {dailyGoals.carbs}g</Text>
              <ProgressBar current={todayTotal.carbs} goal={dailyGoals.carbs} color="#fbc531" />
            </View>

            {/* 지방 */}
            <View style={styles.nutrientItem}>
              <View style={[styles.nutrientIcon, { backgroundColor: '#f093fb' }]}>
                <Text style={styles.nutrientIconText}>🥑</Text>
              </View>
              <Text style={styles.nutrientName}>지방</Text>
              <Text style={styles.nutrientValue}>{todayTotal.fat}g</Text>
              <Text style={styles.nutrientGoal}>목표: {dailyGoals.fat}g</Text>
              <ProgressBar current={todayTotal.fat} goal={dailyGoals.fat} color="#f093fb" />
            </View>
          </View>
        </View>

        {/* 식사 기록 */}
        {MEAL_TYPES.map(mealType => {
          const typeMeals = meals.filter(m => m.type === mealType.id)
          const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0)

          return (
            <View key={mealType.id} style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.mealIcon}>{mealType.icon}</Text>
                  <Text style={styles.mealSectionTitle}>{mealType.name}</Text>
                </View>
                <Text style={styles.mealSectionCalories}>{typeCalories} kcal</Text>
              </View>

              {typeMeals.length === 0 ? (
                <View style={styles.emptyMeal}>
                  <Text style={styles.emptyMealText}>기록된 식사가 없습니다</Text>
                </View>
              ) : (
                typeMeals.map(meal => (
                  <View key={meal.id} style={styles.mealItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mealItemName}>{meal.name}</Text>
                      <Text style={styles.mealItemTime}>{meal.time}</Text>
                      <View style={styles.mealItemNutrients}>
                        <Text style={styles.mealItemNutrient}>단백질 {meal.protein}g</Text>
                        <Text style={styles.mealItemNutrient}>탄수 {meal.carbs}g</Text>
                        <Text style={styles.mealItemNutrient}>지방 {meal.fat}g</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.mealItemCalories}>{meal.calories}</Text>
                      <Text style={styles.mealItemCaloriesLabel}>kcal</Text>
                      <TouchableOpacity onPress={() => handleDeleteMeal(meal.id)} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )
        })}
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>식사 추가</Text>

            {/* Meal Type Selection */}
            <View style={styles.mealTypeRow}>
              {MEAL_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.mealTypeButton, newMeal.type === type.id && { backgroundColor: type.color }]}
                  onPress={() => setNewMeal({ ...newMeal, type: type.id as any })}
                >
                  <Text style={styles.mealTypeIcon}>{type.icon}</Text>
                  <Text style={[styles.mealTypeName, newMeal.type === type.id && { color: 'white' }]}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="음식 이름 (예: 닭가슴살 샐러드)"
              placeholderTextColor="#999"
              value={newMeal.name}
              onChangeText={text => setNewMeal({ ...newMeal, name: text })}
            />

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>칼로리 (kcal)</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="300"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  value={newMeal.calories}
                  onChangeText={text => setNewMeal({ ...newMeal, calories: text })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>단백질 (g)</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="30"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  value={newMeal.protein}
                  onChangeText={text => setNewMeal({ ...newMeal, protein: text })}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>탄수화물 (g)</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="40"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  value={newMeal.carbs}
                  onChangeText={text => setNewMeal({ ...newMeal, carbs: text })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>지방 (g)</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="10"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  value={newMeal.fat}
                  onChangeText={text => setNewMeal({ ...newMeal, fat: text })}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalButtonTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleAddMeal}>
                <Text style={styles.modalButtonText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backText: { color: 'white', fontSize: 20, fontWeight: '800' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: 'white' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: 'white', fontSize: 28, fontWeight: '300' },
  content: { flex: 1, padding: 20 },
  calorieCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 20, marginBottom: 15 },
  calorieHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calorieTitle: { fontSize: 18, fontWeight: '800', color: '#333' },
  calorieDate: { fontSize: 12, color: '#999' },
  calorieMain: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  calorieCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#10b98120', borderWidth: 4, borderColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  calorieValue: { fontSize: 28, fontWeight: '900', color: '#10b981' },
  calorieLabel: { fontSize: 12, color: '#10b981', fontWeight: '600' },
  calorieGoal: { fontSize: 13, color: '#666', marginBottom: 8 },
  calorieRemaining: { fontSize: 13, color: '#999', marginTop: 8 },
  progressBarContainer: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 5 },
  nutrientCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 20, marginBottom: 15 },
  nutrientTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 15 },
  nutrientGrid: { flexDirection: 'row', gap: 10 },
  nutrientItem: { flex: 1, alignItems: 'center' },
  nutrientIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  nutrientIconText: { fontSize: 24 },
  nutrientName: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 6 },
  nutrientValue: { fontSize: 18, fontWeight: '900', color: '#333', marginBottom: 4 },
  nutrientGoal: { fontSize: 10, color: '#999', marginBottom: 8 },
  mealSection: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 20, marginBottom: 15 },
  mealSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  mealIcon: { fontSize: 24 },
  mealSectionTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  mealSectionCalories: { fontSize: 14, fontWeight: '700', color: '#667eea' },
  emptyMeal: { paddingVertical: 20, alignItems: 'center' },
  emptyMealText: { fontSize: 13, color: '#999' },
  mealItem: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  mealItemName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  mealItemTime: { fontSize: 12, color: '#999', marginBottom: 6 },
  mealItemNutrients: { flexDirection: 'row', gap: 10 },
  mealItemNutrient: { fontSize: 11, color: '#666', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  mealItemCalories: { fontSize: 20, fontWeight: '900', color: '#333' },
  mealItemCaloriesLabel: { fontSize: 11, color: '#999' },
  deleteButton: { marginTop: 6, backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  deleteButtonText: { color: 'white', fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: 'white', borderRadius: 25, padding: 25 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#333', marginBottom: 20, textAlign: 'center' },
  mealTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  mealTypeButton: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  mealTypeIcon: { fontSize: 20, marginBottom: 4 },
  mealTypeName: { fontSize: 11, fontWeight: '700', color: '#666' },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#333', borderWidth: 2, borderColor: '#e5e7eb', marginBottom: 15 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 6 },
  inputSmall: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#333', borderWidth: 2, borderColor: '#e5e7eb' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonCancel: { backgroundColor: '#f3f4f6' },
  modalButtonConfirm: { backgroundColor: '#30cfd0' },
  modalButtonTextCancel: { fontSize: 15, fontWeight: '700', color: '#6b7280' },
  modalButtonText: { fontSize: 15, fontWeight: '700', color: 'white' },
})
